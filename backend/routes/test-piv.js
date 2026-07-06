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

        // User ke saare running containers uthao
        const containers = await docker.listContainers();

        // Naye pattern se 'public_web' container dhoondo: ctf_public_web_user_5_pivoting-1
        const webContainer = containers.find(c =>
            c.Names.some(name => name.startsWith(`/ctf_public_web_user_${userId}_`))
        );

        // Agar koi container nahi mila
        if (!webContainer) {
            return res.json({
                success: true,
                running: false
            });
        }

        // Container inspect karo details nikalne ke liye
        const container = docker.getContainer(webContainer.Id);
        const info = await container.inspect();

        // Container name se labId nikalna
        const containerName = webContainer.Names[0].replace("/", "");

        // Name split logic: ["ctf", "public", "web", "user", "userId", "labId"]
        // Udaharan: ctf_public_web_user_5_pivoting-1 split hone par 6 parts banega
        const parts = containerName.split("_");
        
        // userId ke baad jo bhi bache, wo labId hai (pivoting-1)
        const labId = parts.slice(5).join("_");

        // IP nikalne ka logic: public_web hamesha 'net_public_user_...' network se juda hoga
        const expectedNetworkName = `net_public_user_${userId}_${labId}`;
        const network = info.NetworkSettings.Networks[expectedNetworkName];

        // Agar specific network nahi mila (fallback safety), toh pehle network ki IP utha lo
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
        console.log(existing);
        
        if (existing) {
            return res.json({ success: false, message: "A lab is already running. Please stop it first." });
        }

        // ================= NAYA LOGIC: NETWORKS FETCH AUR CREATE =================
        // ctf_networks se lab ke saare networks uthao
        const labNetworks = await query("SELECT * FROM ctf_networks WHERE lab_id = ?", [labId]);
        if (!labNetworks.length) return res.json({ message: "Network configurations not found" });

        // Har user ke liye unique network name banayein (taaki multi-user me clash na ho)
        // net_public -> net_public_user_1_pivoting-1
        // net_private -> net_private_user_1_pivoting-1
        for (const net of labNetworks) {
            const userNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            
            // Apne purane function ko use karke custom subnet aur gateway pass karein
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

        // 3. Get containers/roles from pivoting_containers (Aapki nayi table)
        const containerSpecs = await query("SELECT container_name, role, network_name FROM pivoting_containers WHERE lab_id = ?", [labId]);
        if (!containerSpecs.length) return res.json({ message: "Containers not found for this lab" });

        let webIp = "";

        // 4. Containers create aur start karne ka loop
        for (const spec of containerSpecs) {
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const primaryNetworkName = `${spec.network_name}_user_${userId}_${labId}`;
            
            // Role ke basis par static IP decide karein
            let staticIp = "";
            if (spec.role === "public_web") {
                staticIp = "172.25.0.10"; // Net public ki static IP
            } else if (spec.role === "pivot_node") {
                staticIp = "172.25.0.20"; // Net public interface ki static IP
            }

            const container = await docker.createContainer({
                Image: spec.container_name, // Table ke column ka naam container_name hai jo image represent karta hai
                name: containerName,
                Tty: true, 
                OpenStdin: true,
                HostConfig: { 
                    NetworkMode: primaryNetworkName,
                    CapAdd: ["NET_ADMIN"] // Routing aur VPN capabilities ke liye zaroori
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

            // PIVOTING SPECIFIC: Agar pivot node hai, toh use dusre network (net_private) se bhi connect karo
            if (spec.role === "pivot_node") {
                const privateNetworkName = `net_private_user_${userId}_${labId}`;
                const privateNet = docker.getNetwork(privateNetworkName);
                
                await privateNet.connect({
                    Container: container.id,
                    EndpointConfig: {
                        IPAMConfig: { IPv4Address: "172.30.0.20" } // Net private ke liye static IP
                    }
                });
            }

            // 5. Get IP if it is the public web container to return to user
            if (spec.role === "public_web") {
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



router.post("/stop", auth, async (req, res) => {
    try {
        const { labId } = req.body;
        const userId = req.user.id;
        
        // 1. Nayi table (pivoting_containers) se roles fetch karo taaki exact container names milein
        const containerSpecs = await query(
            "SELECT role FROM pivoting_containers WHERE lab_id = ?", 
            [labId]
        );

        // 2. Loop ke zariye sabhi user-specific containers ko stop aur remove karo
        for (const spec of containerSpecs) {
            // Naming convention wahi jo start API me rakhi thi
            const containerName = `ctf_${spec.role}_user_${userId}_${labId}`;
            const container = docker.getContainer(containerName);

            try {
                // Check karo agar container chal raha hai toh pehle stop karo
                const inspect = await container.inspect();
                if (inspect.State.Running) {
                    await container.stop();
                }
                await container.remove({ force: true });
            } catch (err) {
                // Agar container nahi mila (404), toh ignore karo
                if (err.statusCode !== 404) {
                    console.error(`Error removing container ${containerName}:`, err);
                }
            }
        }

        // 3. Database (ctf_networks) se saare custom networks fetch karo aur unhe delete karo
        const labNetworks = await query(
            "SELECT network_name FROM ctf_networks WHERE lab_id = ?",
            [labId]
        );

        for (const net of labNetworks) {
            // Har network ka wahi dynamic name jo start api me bna tha
            const dynamicNetworkName = `${net.network_name}_user_${userId}_${labId}`;
            const network = docker.getNetwork(dynamicNetworkName);
            
            try {
                await network.remove();
            } catch (err) {
                // Agar network pehle se hi delete hai ya nahi mila, toh ignore karo
                if (err.statusCode !== 404) {
                    console.error(`Error removing network ${dynamicNetworkName}:`, err);
                }
            }
        }

        return res.json({
            success: true,
            message: "Pivoting lab, containers, and all user networks removed successfully"
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