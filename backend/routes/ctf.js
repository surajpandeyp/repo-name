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

router.get("/runningContainer", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Docker se saare running containers ki list nikalo
        const containers = await docker.listContainers();

        // Check karo ki is user ka koi bhi container chal raha hai ya nahi
        // Pattern: `_user_${userId}_` (isase user ka koi bhi container match ho jayega)
        const userContainer = containers.find(c => 
            c.Names.some(name => name.includes(`_user_${userId}_`))
        );

        let runningLabId = null;

        if (userContainer) {
            // Container ke naam se labId extract karne ka logic
            // Maan lo container ka name hai: /my-app_user_12_ctf-1
            // Hum '_user_12_' ke baad wala hissa (labId) nikal lenge
            const matchedName = userContainer.Names.find(name => name.includes(`_user_${userId}_`));
            
            if (matchedName) {
                const parts = matchedName.split(`_user_${userId}_`);
                if (parts.length > 1) {
                    runningLabId = parts[1].replace(/^\//, ''); // Agar aage slash ho toh hata do
                }
            }
        }

        return res.json({
            success: true,
            labId: runningLabId // Agar chal raha hoga toh ID aayegi (jaise "ctf-1"), warna null
        });

    } catch (err) {
        console.error("Error in /runningContainer:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});








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

        if (!labId) {
            return res.json({ success: false, message: "Required lab id" });
        }

        // 1. Check Lab exists or not
        const lab = await query("SELECT * FROM ctf WHERE lab_id=?", [labId]);
        if (!lab.length) {
            return res.json({ success: false, message: "Lab not found" });
        }

        // 2. Subscription Check
        if (!lab[0].is_free) {
            const sub = await query("SELECT * FROM subscriptions WHERE user_id=? AND expiry_date > NOW()", [userId]);
            if (!sub.length) {
                return res.json({ success: false, message: "Subscription required" });
            }
        }

        // 3. Existing Container Check (Is user ka koi bhi container pehle se chal raha hai kya?)
        const running = await docker.listContainers();
        const alreadyRunning = running.find(c => c.Names.some(n => n.includes(`_user_${userId}_`)));
        if (alreadyRunning) {
            return res.json({ success: false, message: "Lab already running" });
        }

        // 4. CHECK CONTAINERS FIRST (Networks banane se PEHLE)
        const containers = await query(
            `SELECT container_name, role, network_name FROM ctf_containers WHERE lab_id = ?`,
            [labId]
        ); 
        
        if (!containers.length) {
            return res.json({
                success: false,
                message: "No Containers Found"
            });
        }

        // 5. DYNAMIC SUBNET NETWORKS CREATE KARO
        const networks = await query("SELECT * FROM ctftwo_networks WHERE lab_id=?", [labId]);

        for (const net of networks) {
            const dockerNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            
            // 🔥 DYNAMIC SUBNET LOGIC: Har user ke liye unique range (e.g., 172.25.5.0/24)
            const dynamicSubnet = `172.25.${userId}.0/24`;
            const dynamicGateway = `172.25.${userId}.1`;

            const allNetworks = await docker.listNetworks();
            const exists = allNetworks.find(n => n.Name === dockerNetworkName);

            if (!exists) {
                await docker.createNetwork({
                    Name: dockerNetworkName,
                    Driver: "bridge",
                    IPAM: {
                        Config: [{
                            Subnet: dynamicSubnet,
                            Gateway: dynamicGateway
                        }]
                    }
                });
            }
        }

        let webIp = "";

        // 6. Containers Start karo
        for (const spec of containers) {
            const image = spec.container_name.trim();
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            let networkMode = "bridge";

            if (spec.network_name) {
                networkMode = `${spec.network_name}_user_${userId}_${labId}`;
            }

            const container = await docker.createContainer({
                Image: image,
                name: containerName,
                Tty: true,
                OpenStdin: true,
                HostConfig: {
                    NetworkMode: networkMode,
                    CapAdd: ["NET_ADMIN"]
                }
            });

            await container.start();

            if (spec.role === "public_web" || spec.role === "web") {
                const info = await container.inspect();
                webIp = info.NetworkSettings.Networks[networkMode].IPAddress;
            }
        }

        return res.json({
            success: true,
            message: "CTF Started Successfully",
            ip: webIp
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ==================== 4. STOP API ====================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        const containerSpecs = await query("SELECT role FROM ctf_containers WHERE lab_id = ?", [labId]);

        // 1. Saare containers ko force remove karo
        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const container = docker.getContainer(containerName);

            try {
                await container.remove({ v: true, force: true });
                await delay(300); 
            } catch (err) {
                if (err.statusCode !== 404) {
                    console.error(`Error removing container ${containerName}:`, err);
                }
            }
        }

        await delay(500);

        // 2. User ke specific networks ko delete karo
        const labNetworks = await query("SELECT network_name FROM ctftwo_networks WHERE lab_id = ?", [labId]);

        for (const net of labNetworks) {
            const dynamicNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            const network = docker.getNetwork(dynamicNetworkName);
            
            try {
                await network.remove();
                await delay(300); 
            } catch (err) {
                if (err.statusCode !== 404) {
                    console.error(`Error removing network ${dynamicNetworkName}:`, err);
                }
            }
        }

        return res.json({
            success: true,
            message: "Lab, containers, and user networks removed cleanly"
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