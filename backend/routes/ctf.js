const Docker = require("dockerode");
const express = require("express");
const router = express.Router();
const conn = require("../db");
const auth = require("./midd");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, function (err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ==================== 1. STATUS API ====================
router.get("/status", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const containers = await docker.listContainers();

        // Pattern se 'public_web' container dhoondo
        const webContainer = containers.find(c =>
            c.Names.some(name => name.startsWith(`/ctf_public_web_user_${userId}_`))
        );

        if (!webContainer) {
            return res.json({
                success: true,
                running: false
            });
        }

        const container = docker.getContainer(webContainer.Id);
        const info = await container.inspect();

        const containerName = webContainer.Names[0].replace("/", "");
        const parts = containerName.split("_");
        const labId = parts.slice(5).join("_");

        const expectedNetworkName = `net_public_user_${userId}_${labId}`;
        const network = info.NetworkSettings.Networks[expectedNetworkName];

        const ip = network ? network.IPAddress : (Object.values(info.NetworkSettings.Networks)[0]?.IPAddress || "");

        return res.json({
            success: true,
            running: true,
            labId,
            ip
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Helper function
async function getOrCreateNetwork(networkName) {
    const networks = await docker.listNetworks();
    const net = networks.find(n => n.Name === networkName);
    if (net) return docker.getNetwork(net.Id);
    return await docker.createNetwork({ Name: networkName, Driver: "bridge" });
}

// ==================== 2. SUBSCRIBE API ====================
router.get("/subcribe", auth, async(req, res) => {
    try {
        const userId = req.user.id;
        const findUser = await query("SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()", [userId]);
        if(!findUser.length){
            return res.json({ message: "Subscription required" });
        }
        return res.json({ success: true, message: "Subscription active" });
    } catch (error) {
        return res.status(500).send(error);
    }
});

// ==================== 3. START API ====================
router.post("/start", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;

        // 1. Database Checks
        const findId = await query("SELECT * FROM ctf WHERE lab_id = ?", [labId]);
        if (findId.length === 0) return res.json({ message: "Lab not found" });
        
        if (!findId[0].is_free) {
            const sub = await query("SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()", [userId]);
            if (!sub.length) return res.json({ message: "Subscription required" });
        }
        
        // 2. Check if any container for this user is already running
        const allContainers = await docker.listContainers();
        const existing = allContainers.find(c => c.Names.some(n => n.includes(`_user_${userId}_`)));
        
        if (existing) {
            return res.json({ success: false, message: "A lab is already running. Please stop it first." });
        }

        // 3. Networks Fetch Aur Create
        const labNetworks = await query("SELECT * FROM ctftwo_networks WHERE lab_id = ?", [labId]);
        if (!labNetworks.length) return res.json({ message: "Network configurations not found" });

        for (const net of labNetworks) {
            const userNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            const networks = await docker.listNetworks();
            const existingNet = networks.find(n => n.Name === userNetworkName);
            
            if (!existingNet) {
                await docker.createNetwork({
                    Name: userNetworkName,
                    Driver: "bridge",
                    IPAM: {
                        Config: [{ Subnet: net.subnet, Gateway: net.gateway }]
                    }
                });
            }
        }

        // 4. Get containers specs from pivoting_containers table
        const containerSpecs = await query("SELECT container_name, role, network_name FROM ctf_containers WHERE lab_id = ?", [labId]);
        if (!containerSpecs.length) return res.json({ message: "Containers not found for this lab" });

        let webIp = "";

        // 5. Create Aur Start Loop
        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const primaryNetworkName = `${spec.network_name}_user_${userId}_${labId}`;
            
            // Dynamic IP mapping based on role/network
            let staticIp = "";
            if (spec.network_name === "net_public") {
                staticIp = "172.25.0.10"; // Public web container ka public interface IP
            } else if (spec.network_name === "net_private") {
                staticIp = "172.30.0.20"; // Baki internal nodes ki private IP
            }

            const container = await docker.createContainer({
                Image: spec.container_name,
                name: containerName,
                Tty: true, 
                OpenStdin: true,
                HostConfig: { 
                    NetworkMode: primaryNetworkName,
                    CapAdd: ["NET_ADMIN"]
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        [primaryNetworkName]: {
                            IPAMConfig: { IPv4Address: staticIp }
                        }
                    }
                }
            });

            await container.start();

            // ================= ASLI LOGIC CHANGE =================
            // Agar role 'public_web' hai, toh use net_public to mil gaya, 
            // ab use instantly net_private se bhi jodo taaki use internal range bhi mil jaye!
            if (spec.role === "public_web") {
                const privateNetworkName = `net_private_user_${userId}_${labId}`;
                const privateNet = docker.getNetwork(privateNetworkName);
                
                await privateNet.connect({
                    Container: container.id,
                    EndpointConfig: {
                        IPAMConfig: { IPv4Address: "172.30.0.10" } // public_web ka internal network IP
                    }
                });

                // User ko response bhejne ke liye public network wali IP uthao
                const info = await container.inspect();
                webIp = info.NetworkSettings.Networks[primaryNetworkName].IPAddress;
            }
        }

        return res.json({ success: true, message: "Pivoting lab started successfully", ip: webIp });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== 4. STOP API ====================
// Chhota sa helper function jo Docker API ko saans lene ka time dega
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        const containerSpecs = await query("SELECT role FROM ctf_containers WHERE lab_id = ?", [labId]);

        // 1. Pehle saare containers ko ek-ek karke clear karo
        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const container = docker.getContainer(containerName);

            try {
                // Seedha force remove maaro! Alag se inspect aur stop karne ki zaroori nahi hai.
                // v: true (volumes delete karega), force: true (agar running hai toh pehle kill karega fir remove)
                await container.remove({ v: true, force: true });
                
                // Har container hatane ke baad 300ms ka chhota sa gap do taaki socket free ho jaye
                await delay(300); 
            } catch (err) {
                if (err.statusCode !== 404) {
                    console.error(`Error removing container ${containerName}:`, err);
                }
            }
        }   

        // 2. Chhota sa pause networks delete karne se pehle
        await delay(500);

        // 3. Ab networks ko delete karo
        const labNetworks = await query("SELECT network_name FROM ctftwo_networks WHERE lab_id = ?", [labId]);

        for (const net of labNetworks) {
            const dynamicNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            const network = docker.getNetwork(dynamicNetworkName);
            
            try {
                await network.remove();
                await delay(300); // Network remove hone ke baad bhi chhota sa pause
            } catch (err) {
                if (err.statusCode !== 404) {
                    console.error(`Error removing network ${dynamicNetworkName}:`, err);
                }
            }
        }

        return res.json({
            success: true,
            message: "Pivoting lab, containers, and all user networks removed cleanly without socket errors"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
module.exports = router;
