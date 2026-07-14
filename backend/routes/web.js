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

        // -------------------------
        // Check Lab
        // -------------------------
        const lab = await query(
            "SELECT * FROM web WHERE lab_id=?",
            [labId]
        );

        if (!lab.length) {
            return res.json({
                success: false,
                message: "Lab not found"
            });
        }

        // -------------------------
        // Subscription Check
        // -------------------------
        if (!lab[0].is_free) {

            const sub = await query(
                "SELECT * FROM subscriptions WHERE user_id=? AND expiry_date > NOW()",
                [userId]
            );

            if (!sub.length) {

                return res.json({
                    success: false,
                    message: "Subscription required"
                });

            }
        }

        // -------------------------
        // Existing Container Check
        // -------------------------
        const running = await docker.listContainers();

        const alreadyRunning = running.find(c =>
            c.Names.some(n => n.includes(`_user_${userId}_`))
        );

        if (alreadyRunning) {

            return res.json({
                success: false,
                message: "Lab already running"
            });

        }

        // -------------------------
        // Create Networks
        // -------------------------
        const networks = await query(
            "SELECT * FROM web_networks WHERE lab_id=?",
            [labId]
        );

        for (const net of networks) {

            const dockerNetworkName =
                `${net.network_name}_user_${userId}_${labId}`;

            const allNetworks =
                await docker.listNetworks();

            const exists =
                allNetworks.find(n => n.Name === dockerNetworkName);

            if (!exists) {

                await docker.createNetwork({

                    Name: dockerNetworkName,

                    Driver: "bridge",

                    IPAM: {

                        Config: [{
                            Subnet: net.subnet,
                            Gateway: net.gateway
                        }]

                    }

                });

            }

        }

        // -------------------------
        // Fetch Containers
        // -------------------------
        const containers = await query(
            `SELECT container_name,
                    role,
                    network_name
             FROM web_containers
             WHERE lab_id=?`,
            [labId]
        );

        if (!containers.length) {

            return res.json({
                success: false,
                message: "No Containers Found"
            });

        }

        let webIp = "";

        // -------------------------
        // Start All Containers
        // -------------------------
        for (const spec of containers) {

            const image =
                spec.container_name.trim();

            const containerName =
                `ctf_${spec.role}_user_${userId}_${labId}`;

            let networkMode = "bridge";

            if (spec.network_name) {

                networkMode =
                    `${spec.network_name}_user_${userId}_${labId}`;

            }

            const container =
                await docker.createContainer({

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

            // Public Container ki IP bhejna
            if (
                spec.role === "public_web" ||
                spec.role === "web"
            ) {

                const info =
                    await container.inspect();

                webIp =
                    info.NetworkSettings.Networks[networkMode].IPAddress;

            }

        }

        return res.json({

            success: true,

            message: "CTF Started Successfully",

            ip: webIp

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }
});
// ==================== 4. STOP API ====================
// Chhota sa helper function jo Docker API ko saans lene ka time dega
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        const containerSpecs = await query("SELECT role FROM web_containers WHERE lab_id = ?", [labId]);

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
        const labNetworks = await query("SELECT network_name FROM web_networks WHERE lab_id = ?", [labId]);

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
