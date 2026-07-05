const express = require("express");
const Docker = require("dockerode");
const conn = require("../db");
const auth = require("./midd");

const router = express.Router();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, function (err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ========================================================
// 1. STATUS ROUTE: Robust Main App Container Filtering
// ========================================================
router.get("/status", auth, async function (req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userId = req.user.id;

        // Fetch only running containers from Docker
        const activeContainers = await docker.listContainers({
            filters: JSON.stringify({ status: ["running"] })
        });

        // Filter exclusively for the main application container and ignore DB containers
        const userAppPattern = `app_${userId}_`; 
        const userContainer = activeContainers.find(container => 
            container.Names.some(name => name.includes(userAppPattern))
        );

        if (userContainer) {
            const fullName = userContainer.Names.find(name => name.includes(userAppPattern)) || userContainer.Names[0];
            const parts = fullName.replace("/", "").split("_"); // Format: ["app", "userId", "labId"]
            const runningLabId = parts[parts.length - 1]; 

            // Inspect container to extract live network IP address
            const containerRef = docker.getContainer(userContainer.Id);
            const info = await containerRef.inspect();
            const networkName = `net_${userId}_${runningLabId}`;
            const finalIP = info.NetworkSettings.Networks[networkName]?.IPAddress || "";

            return res.json({
                success: true,
                running: true,
                labId: parseInt(runningLabId), 
                ip: finalIP
            });
        }

        return res.json({ success: true, running: false });

    } catch (err) {
        console.log("STATUS ERROR:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ========================================================
// 2. START ROUTE: Strict Active Lab Checking & Launching
router.post("/start", auth, async function (req, res) {
    try {
        const { labId } = req.body;

        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userId = req.user.id;

        if (!labId) {
            return res.status(400).json({
                success: false,
                message: "Lab ID Required"
            });
        }

        const userPattern = `app_${userId}_`;

        // ---------------------------
        // 1. Check active containers
        // ---------------------------
        const activeContainers = await docker.listContainers({
            all: true,
            filters: JSON.stringify({ status: ["running"] })
        });

        const existing = activeContainers.find(c =>
            c.Names.some(n => n.includes(userPattern))
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You already have a running lab. Stop it first."
            });
        }

        // ---------------------------
        // 2. DB validation
        // ---------------------------
        const labRows = await query("SELECT * FROM ctf WHERE lab_id = ?", [labId]);
        if (!labRows.length) {
            return res.status(404).json({ success: false, message: "Lab Not Found" });
        }

        const lab = labRows[0];

        // subscription check
        if (!lab.is_free) {
            const sub = await query(
                "SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()",
                [userId]
            );

            if (!sub.length) {
                return res.status(403).json({
                    success: false,
                    message: "Subscription Required"
                });
            }
        }

        // ---------------------------
        // 3. Images
        // ---------------------------
        const images = await query(
            "SELECT image_name, role FROM ctf_containers WHERE lab_id = ?",
            [labId]
        );

        if (!images.length) {
            return res.status(404).json({
                success: false,
                message: "No images configured"
            });
        }

        let appImage = "";
        let dbImage = "";

        for (const img of images) {
            if (img.role === "app" || img.role === "pivot") appImage = img.image_name;
            if (img.role === "db") dbImage = img.image_name;
        }

        const suffix = `${userId}_${labId}`;
        const networkName = `ctf_net_${suffix}`;

        const appContainerName = `app_${suffix}`;
        const dbContainerName = `db_${suffix}`;

        // ---------------------------
        // 4. CREATE NETWORK (SAFE)
        // ---------------------------
        let network;

        try {
            network = await docker.createNetwork({
                Name: networkName,
                Driver: "bridge"
            });
        } catch (e) {
            network = docker.getNetwork(networkName);
        }

        // ---------------------------
        // 5. CLEAN OLD CONTAINERS
        // ---------------------------
        const allContainers = await docker.listContainers({ all: true });

        for (const c of allContainers) {
            if (
                c.Names.some(n =>
                    n === `/${appContainerName}` ||
                    n === `/${dbContainerName}`
                )
            ) {
                const container = docker.getContainer(c.Id);

                try {
                    await container.stop().catch(() => {});
                    await container.remove({ force: true });
                } catch (err) {
                    console.log("Cleanup error:", err.message);
                }
            }
        }

        // ---------------------------
        // 6. DB CONTAINER
        // ---------------------------
        if (dbImage) {
            const db = await docker.createContainer({
                Image: dbImage,
                name: dbContainerName,
                HostConfig: {
                    NetworkMode: networkName
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        [networkName]: {
                            Aliases: ["ctf-db"]
                        }
                    }
                }
            });

            await db.start();
        }

        // ---------------------------
        // 7. APP CONTAINER
        // ---------------------------
        if (!appImage) {
            return res.status(500).json({
                success: false,
                message: "App image missing"
            });
        }

        const app = await docker.createContainer({
            Image: appImage,
            name: appContainerName,
            HostConfig: {
                NetworkMode: networkName
            },
            NetworkingConfig: {
                EndpointsConfig: {
                    [networkName]: {
                        Aliases: ["ctf-app"]
                    }
                }
            }
        });

        await app.start();

        const info = await app.inspect();
        const ip = info.NetworkSettings.Networks[networkName].IPAddress;

        return res.json({
            success: true,
            message: "Lab started successfully",
            network: networkName,
            containers: {
                app: appContainerName,
                db: dbContainerName
            },
            ip: ip
        });

    } catch (err) {
        console.log("START ERROR:", err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// ========================================================
// 3. STOP ROUTE: Complete Containers & Network Cleanup
// ========================================================
router.post("/stop", auth, async function (req, res) {
    try {
        const { labId } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid Session" });
        }
        const userId = req.user.id;

        if (!labId) {
            return res.status(400).json({ success: false, message: "Lab ID Required" });
        }

        const uniqueSuffix = `${userId}_${labId}`;
        const dbContainerName = `db_${uniqueSuffix}`;
        const appContainerName = `app_${uniqueSuffix}`;
        const networkName = `net_${uniqueSuffix}`;

        const allContainers = await docker.listContainers({ all: true });

        // 1. Terminate and drop active containers safely
        for (const c of allContainers) {
            if (c.Names.some(name => name === `/${dbContainerName}` || name === `/${appContainerName}`)) {
                try {
                    const targetContainer = docker.getContainer(c.Id);
                    console.log(`Stopping & removing container: ${c.Names[0]}`);
                    await targetContainer.remove({ force: true });
                } catch (rmErr) {
                    console.log(`Error removing container ${c.Names[0]}:`, rmErr.message);
                }
            }
        }

        // 2. Destruct the custom allocated bridge network
        try {
            const network = docker.getNetwork(networkName);
            console.log(`Removing Docker network: ${networkName}`);
            await network.remove();
        } catch (netErr) {
            console.log(`Network removal skipping/not found: ${networkName}`);
        }

        return res.json({
            success: true,
            message: "Lab stopped and cleaned successfully!"
        });

    } catch (err) {
        console.log("STOP ROUTE ERROR:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;