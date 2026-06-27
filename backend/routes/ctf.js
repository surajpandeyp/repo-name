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

router.post("/start", auth, async function (req, res) {
    try {
        const { labId } = req.body;
        const userId = req.user.id; // Unique user identity

        if (!labId) {
            return res.status(400).json({ success: false, message: "Lab ID Required" });
        }

        // 1. Lab Check
        const labRows = await query("SELECT * FROM ctf WHERE lab_id = ?", [labId]);
        if (labRows.length === 0) {
            return res.status(404).json({ success: false, message: "Lab Not Found" });
        }
        const lab = labRows[0];

        // 2. Subscription Check for Paid Labs
        if (!lab.is_free) {
            const subRows = await query(
                `SELECT * FROM subscriptions WHERE user_id = ? AND expiry_date > NOW()`,
                [userId]
            );
            if (subRows.length === 0) {
                return res.status(403).json({ success: false, message: "Subscription Required" });
            }
        }

        // 3. Database se Images Fetch Karein (Aapke schema ke hisab se image mapping table)
        // Mana ki ctf_containers me ab 'image_name' aur 'role' (app ya db) save hai
        const imageRows = await query(
            `SELECT image_name, role FROM ctf_containers WHERE lab_id = ?`,
            [labId]
        );

        if (imageRows.length === 0) {
            return res.status(404).json({ success: false, message: "No Images Configured for this Lab" });
        }

        // 4. User ke liye Unique Network Name aur Container Names set karein
        const uniqueSuffix = `${userId}_${labId}`;
        const networkName = `net_${uniqueSuffix}`;
        
        let appImage = "";
        let dbImage = "";

        imageRows.forEach(row => {
            if (row.role === "db") dbImage = row.image_name;       // e.g., vertex-db-backend-img:v1
            if (row.role === "app" || row.role === "pivot") appImage = row.image_name; // e.g., vertex-staff-portal-app:v1
        });

        const dbContainerName = `db_${uniqueSuffix}`;
        const appContainerName = `app_${uniqueSuffix}`;

        // 5. Dynamic Bridge Network Create Karein (Dono containers ko aapas me jodne ke liye)
        let network;
        try {
            network = await docker.createNetwork({
                Name: networkName,
                Driver: "bridge"
            });
        } catch (netErr) {
            // Agar network pehle se bana hai toh usko fetch kar lo
            network = docker.getNetwork(networkName);
        }

        // 6. PEHLE: Database Container Create aur Start Karein
        console.log("Creating DB Container:", dbContainerName);
        const dbContainer = await docker.createContainer({
            Image: dbImage,
            name: dbContainerName,
            HostConfig: {
                NetworkMode: networkName
            }
        });
        await dbContainer.start();

        // 7. BAAD ME: Web App Container Create aur Start Karein
        console.log("Creating Web App Container:", appContainerName);
        const appContainer = await docker.createContainer({
            Image: appImage,
            name: appContainerName,
            HostConfig: {
                NetworkMode: networkName
                // Agar Kali machine ke kisi manual port par bind karna ho (Optional):
                // PortBindings: { "80/tcp": [{ HostPort: "8000" }] } 
            }
        });
        await appContainer.start();

        // 8. Container Inspect karke uski exact Dynamic IP Address nikalye
        const updatedInfo = await appContainer.inspect();
        const networks = updatedInfo.NetworkSettings.Networks;
        const finalIP = networks[networkName].IPAddress;

        // 9. Response me User ko direct Web App ki internal network IP de dein
        return res.json({
            success: true,
            message: "Lab started successfully!",
            ip: finalIP // Kali Machine se direct ping/access ho jayegi ye IP
        });

    } catch (err) {
        console.log("START ERROR:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


router.post("/stop", auth, async function (req, res) {
    try {
        const { labId } = req.body;
        const userId = req.user.id;

        if (!labId) {
            return res.status(400).json({ success: false, message: "Lab ID Required" });
        }

        const uniqueSuffix = `${userId}_${labId}`;
        const dbContainerName = `db_${uniqueSuffix}`;
        const appContainerName = `app_${uniqueSuffix}`;
        const networkName = `net_${uniqueSuffix}`;

        // 1. Web App Container Stop aur Remove karein
        try {
            const appContainer = docker.getContainer(appContainerName);
            await appContainer.stop();
            await appContainer.remove();
            console.log("Removed:", appContainerName);
        } catch (e) { console.log("App container clean error or already removed"); }

        // 2. DB Container Stop aur Remove karein
        try {
            const dbContainer = docker.getContainer(dbContainerName);
            await dbContainer.stop();
            await dbContainer.remove();
            console.log("Removed:", dbContainerName);
        } catch (e) { console.log("DB container clean error or already removed"); }

        // 3. Network Delete Karein
        try {
            const network = docker.getNetwork(networkName);
            await network.remove();
            console.log("Network Removed:", networkName);
        } catch (e) { console.log("Network removal error"); }

        return res.json({
            success: true,
            message: "Lab Stopped and Cleaned Successfully"
        });

    } catch (err) {
        console.log("STOP ERROR:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;