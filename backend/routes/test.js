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


router.get("/status", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Saare running containers nikalo
        const containers = await docker.listContainers();

        // 2. Sirf 'web' role wala container dhundo jo is user ka ho
        // Naming convention: ctf_{role}_{userId}_{labId}
        const webContainer = containers.find(c => 
            c.Names.some(name => name.startsWith(`/ctf_web_${userId}_`))
        );

        // Agar web container nahi milta, to lab running nahi hai
        if (!webContainer) {
            return res.json({
                success: true,
                running: false
            });
        }

        // 3. Web container inspect karo
        const container = docker.getContainer(webContainer.Id);
        const info = await container.inspect();

        // 4. LabId nikalo (container name: ctf_web_userId_labId)
        const containerName = webContainer.Names[0].replace("/", "");
        const parts = containerName.split("_");
        const labId = Number(parts[3]);

        // 5. IP nikalo (Dynamic network support)
        const networkNames = Object.keys(info.NetworkSettings.Networks);
        const ip = info.NetworkSettings.Networks[networkNames[0]].IPAddress;

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


async function getOrCreateNetwork(networkName) {
    const networks = await docker.listNetworks();
    const net = networks.find(n => n.Name === networkName);
    if (net) return docker.getNetwork(net.Id);
    return await docker.createNetwork({ Name: networkName, Driver: "bridge" });
}

router.get("/subcribe", auth, async(req,res) =>{
    try {
        const userId = req.user.id
        
        const findUser = await query("Select *  FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()", [userId]);
        if(!findUser.length){
            return res.json({ message: "Subscription required"})
        }

    } catch (error) {
        return res.send(error)
    }
})
router.post("/start", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        const networkName = `net_ctf_${userId}_${labId}`;

        // 1. Database Checks
        const findId = await query("SELECT * FROM ctf WHERE lab_id = ?", [labId]);
        if (findId.length === 0) return res.json({ message: "Lab not found" });
        
        if (!findId[0].is_free) {
            const sub = await query("SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()", [userId]);
            if (!sub.length) return res.json({ message: "Subscription required" });
        }
        
        // 2. Check if any container for this user is already running
        const allContainers = await docker.listContainers();
        const existing = allContainers.find(c => c.Names.some(n => n.includes(`_${userId}_`)));
        
        if (existing) {
            return res.json({ success: false, message: "A lab is already running. Please stop it first." });
        }

        // 3. Get images/roles
        const containerSpecs = await query("SELECT image_name, role FROM ctf_containers WHERE lab_id = ?", [labId]);
        if (!containerSpecs.length) return res.json({ message: "Image not found" });

        // 4. Create Networ and Containers
        await getOrCreateNetwork(networkName);
        let webIp = "";

        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_${userId}_${labId}`;
            
            const container = await docker.createContainer({
                Image: spec.image_name,
                name: containerName,
                Tty: true, 
                OpenStdin: true,
                HostConfig: { NetworkMode: networkName }
            });

            await container.start();

            // 5. Get IP if it is the web container
            if (spec.role === "web") {
                const info = await container.inspect();
                webIp = info.NetworkSettings.Networks[networkName].IPAddress;
            }
        }

        return res.json({ success: true, message: "Lab started", ip: webIp });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});






router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        // 1. Database se roles fetch karo taaki container names ka pata chale
        const containerSpecs = await query(
            "SELECT role FROM ctf_containers WHERE lab_id = ?", 
            [labId]
        );

        // 2. Loop ke zariye sabhi containers ko stop aur remove karo
        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_${userId}_${labId}`;
            const container = docker.getContainer(containerName);

            try {
                // Check if container exists before stopping
                const inspect = await container.inspect();
                if (inspect.State.Running) {
                    await container.stop();
                }
                await container.remove({ force: true });
            } catch (err) {
                // Agar container nahi mila (404), to ignore karo
                if (err.statusCode !== 404) {
                    console.error(`Error removing container ${containerName}:`, err);
                }
            }
        }

        // 3. Custom Network delete karo
        const networkName = `net_ctf_${userId}_${labId}`;
        const network = docker.getNetwork(networkName);
        
        try {
            await network.remove();
        } catch (err) {
            // Agar network nahi mila to ignore karo
            if (err.statusCode !== 404) {
                console.error("Error removing network:", err);
            }
        }

        return res.json({
            success: true,
            message: "Lab, containers, and network removed successfully"
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