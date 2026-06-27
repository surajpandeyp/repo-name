
const express = require("express");
const Docker = require("dockerode");
const conn = require("../db");
const auth = require("./midd");

const router = express.Router();

const docker = new Docker({
    socketPath: "/var/run/docker.sock"
});


function query(sql, values = []) {
    return new Promise((resolve, reject) => {

        conn.query(sql, values, function (err, rows) {

            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

        });

    });
}

router.post("/start", auth, async function (req, res) {

    try {

        const { labId } = req.body;

        if (!labId) {
            return res.status(400).json({
                success: false,
                message: "Lab ID Required"
            });
        }

        // Lab Check
        const labRows = await query(
            "SELECT * FROM web WHERE lab_id = ?",
            [labId]
        );

        if (labRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lab Not Found"
            });
        }

        const lab = labRows[0];

        // Paid Lab Check
        if (!lab.is_free) {

            const userId = req.user.id;

            const subRows = await query(
                `SELECT * FROM subscriptions
                 WHERE user_id = ?
                 AND expiry_date > NOW()`,
                [userId]
            );

            if (subRows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Subscription Required"
                });
            }
        }

        // Containers Fetch
        const containerRows = await query(
            `SELECT container_name
             FROM web_containers
             WHERE lab_id = ?`,
            [labId]
        );

        const containers = containerRows.map(
            row => row.container_name
        );

        if (containers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Containers Found"
            });
        }

        let pivotIP = null;

        // Start Containers
        for (const name of containers) {

            console.log("Starting:", name);

            const container =
                docker.getContainer(name);

            const info =
                await container.inspect();

            if (info.State.Status !== "running") {
                await container.start();
            }

            const updatedInfo =
                await container.inspect();

            if (name.includes("pivot")) {

                const networks =
                    updatedInfo.NetworkSettings.Networks;

                const firstNetwork =
                    Object.keys(networks)[0];

                pivotIP =
                    networks[firstNetwork].IPAddress;
            }
        }

        return res.json({
            success: true,
            ip: pivotIP
        });

    } catch (err) {

        console.log("START ERROR:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


router.post("/stop", auth, async function (req, res) {

    try {

        const { labId } = req.body;

        if (!labId) {
            return res.status(400).json({
                success: false,
                message: "Lab ID Required"
            });
        }

        // Database se containers lao
        const containerRows = await query(
            `SELECT container_name
             FROM web_containers
             WHERE lab_id = ?`,
            [labId]
        );

        if (containerRows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "No Containers Found"
            });

        }

        const containers = containerRows.map(
            row => row.container_name
        );

        // Containers Stop
        for (const name of containers) {

            console.log("Stopping:", name);

            const container =
                docker.getContainer(name);

            const info =
                await container.inspect();

            if (info.State.Status === "running") {

                await container.kill();

            }

        }

        return res.json({
            success: true,
            message: "Lab Stopped Successfully"
        });

    } catch (err) {

        console.log("STOP ERROR:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


module.exports = router;