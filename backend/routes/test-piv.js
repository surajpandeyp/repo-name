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

        const webContainer = containers.find(c =>
            c.Names.some(name => name.startsWith(`/ctf_public_web_user_${userId}_`))
        );

        if (!webContainer) {
            return res.json({ success: true, running: false });
        }

        const container = docker.getContainer(webContainer.Id);
        const info = await container.inspect();

        const containerName = webContainer.Names[0].replace("/", "");
        const parts = containerName.split("_");
        const labId = parts.slice(5).join("_");

        const expectedNetworkName = `net_public_user_${userId}_${labId}`;
        const network = info.NetworkSettings.Networks[expectedNetworkName];

        const ip = network ? network.IPAddress : (Object.values(info.NetworkSettings.Networks)[0]?.IPAddress || "");

        return res.json({ success: true, running: true, labId, ip });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

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

// ==================== 3. START API (Dynamic Subnet for Pivoting) ====================
router.post("/start", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;

        console.log("AUTH USER OBJECT:", req.user);

        const findId = await query("SELECT * FROM pivoting WHERE lab_id = ?", [labId]);
        if (findId.length === 0) return res.json({ success: false, message: "Lab not found" });
        
        if (!findId[0].is_free) {
            const sub = await query("SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()", [userId]);
            if (!sub.length) return res.json({ success: false, message: "Subscription required" });
        }
        
        const allContainers = await docker.listContainers();
        const existing = allContainers.find(c => c.Names.some(n => n.includes(`_user_${userId}_`)));
        
        if (existing) {
            return res.json({ success: false, message: "Active lab detected. Please stop your running lab to proceed.." });
        }

        const findcontainers = await query(
            `SELECT container_name, role, network_name FROM pivoting_containers WHERE lab_id=?`,
            [labId]
        );
        
        if (!findcontainers.length) {
            return res.json({ success: false, message: "No Containers Found" });
        }

        const labNetworks = await query("SELECT * FROM ctf_networks WHERE lab_id = ?", [labId]);
        if (!labNetworks.length) return res.json({ success: false, message: "Network configurations not found" });

        // 🔥 DYNAMIC SUBNET LOGIC: Har network type ke liye user-specific unique range generate karein
        // Jaise agar userId = 5 hai, toh public net banega 172.25.5.0/24 aur private net banega 172.30.5.0/24
        for (const net of labNetworks) {
            const userNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            
            let dynamicSubnet, dynamicGateway;
            if (net.network_name === "net_public") {
                dynamicSubnet = `172.25.${userId}.0/24`;
                dynamicGateway = `172.25.${userId}.1`;
            } else if (net.network_name === "net_private") {
                dynamicSubnet = `172.30.${userId}.0/24`;
                dynamicGateway = `172.30.${userId}.1`;
            } else {
                // Fallback agar koi aur network ho
                dynamicSubnet = net.subnet;
                dynamicGateway = net.gateway;
            }

            const networks = await docker.listNetworks();
            const existingNet = networks.find(n => n.Name === userNetworkName);
            
            if (!existingNet) {
                await docker.createNetwork({
                    Name: userNetworkName,
                    Driver: "bridge",
                    IPAM: {
                        Config: [{ Subnet: dynamicSubnet, Gateway: dynamicGateway }]
                    }
                });
            }
        }

        let webIp = "";

        for (const spec of findcontainers) {
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const primaryNetworkName = `${spec.network_name}_user_${userId}_${labId}`;
            
            let staticIp = "";
            if (spec.network_name === "net_public") {
                staticIp = `172.25.${userId}.2`;
            } else if (spec.network_name === "net_private") {
                staticIp = `172.30.${userId}.20`;
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

            if (spec.role === "public_web") {
                const privateNetworkName = `net_private_user_${userId}_${labId}`;
                const privateNet = docker.getNetwork(privateNetworkName);
                
                await privateNet.connect({
                    Container: container.id,
                    EndpointConfig: {
                        IPAMConfig: { IPv4Address: `172.30.${userId}.10` }
                    }
                });

                const info = await container.inspect();
                webIp = info.NetworkSettings.Networks[primaryNetworkName].IPAddress;
            }
        }

        return res.json({ success: true, message: "Pivoting lab started successfully with dynamic subnets", ip: webIp });

    } catch (err) {
        console.error(err);
        let errorMessage = err.message;
        if (err.statusCode === 404 && errorMessage.includes("no such image")) {
            errorMessage = "The required Docker image for this lab does not exist on the server.";
        }
        return res.status(500).json({ success: false, message: errorMessage });
    }
});

// ==================== 4. STOP API ====================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        const containerSpecs = await query("SELECT role FROM pivoting_containers WHERE lab_id = ?", [labId]);

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

        const labNetworks = await query("SELECT network_name FROM ctf_networks WHERE lab_id = ?", [labId]);

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
            message: "Pivoting lab, containers, and all user networks removed cleanly"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;