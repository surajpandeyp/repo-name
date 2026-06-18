const express = require("express");
const Docker = require("dockerode");

const router = express.Router();

const docker = new Docker({
    socketPath: "/var/run/docker.sock"
});


// =====================================
// START LAB
// =====================================
router.post("/start", async function (req, res) {

    try {

        // Frontend Se Containers
        const containers = req.body.containers;

        /*
            Example:

            {
                "containers": [
                    "internal",
                    "pivot"
                ]
            }
        */

        if (!containers || containers.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No Containers Provided"
            });

        }

        let pivotIP = null;

        // Sare Containers Start
        for (const name of containers) {

            console.log("Starting:", name);

            const container =
                docker.getContainer(name);

            // Container Info
            const info =
                await container.inspect();

            // Agar Running Nahi Hai
            if (info.State.Status !== "running") {

                await container.start();

            }

            // Updated Info
            const updatedInfo =
                await container.inspect();

            /*
                Pivot Container Ka IP

                Works For:
                pivot
                pivot2
                pivot3
                pivot4
            */

            if (name.includes("pivot")) {

                const networks =
                    updatedInfo.NetworkSettings.Networks;

                const firstNetwork =
                    Object.keys(networks)[0];

                pivotIP =
                    networks[firstNetwork].IPAddress;

            }

        }

        console.log("Pivot IP:", pivotIP);

        // Response
        res.json({
            success: true,
            ip: pivotIP
        });

    } catch (err) {

        console.log("START ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// =====================================
// STOP LAB
// =====================================
router.post("/stop", async function (req, res) {

    try {

        const containers = req.body.containers;

        if (!containers || containers.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No Containers Provided"
            });

        }

        // Sare Containers Stop
        for (const name of containers) {

            console.log("Stopping:", name);

            const container =
                docker.getContainer(name);

            const info =
                await container.inspect();

            // Agar Running Hai
            if (info.State.Status === "running") {

                /*
                    Instant Stop

                    stop() kabhi kabhi timeout karta hai
                    isliye kill() use kar rahe
                */

                await container.kill();

            }

        }

        res.json({
            success: true,
            message: "Lab Stopped Successfully"
        });

    } catch (err) {

        console.log("STOP ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;