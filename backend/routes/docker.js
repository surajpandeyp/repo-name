const express = require("express");
const Docker = require("dockerode");
const conn = require("../db")
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("./midd");

const docker = new Docker({
    socketPath: "/var/run/docker.sock"
});

//==========================
// login api
//============

router.post("/login", function (req, res) {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and Password Required"
        });

    }
      
    const sql =
        "SELECT * FROM users WHERE email = ?";

    conn.query(
        sql,
        [email],
        function (err, results) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: err.message
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid Email"
                });

            }

            const user = results[0];
            
            const token = jwt.sign(
                {id:user.id,email:user.email},
                "suraj123456",
                {expiresIn:"1h"}
            )
            if (user.password !== password) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                });

            }

            res.json({
                success: true,
                message: "Login Successful",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
            
        }
    );

});


router.post("/register", (req, res) => {

    const { username, email, password, cpassword } = req.body;

    if (!username || !email || !password || !cpassword) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password !== cpassword) {
        return res.status(400).json({
            message: "Passwords do not match"
        });
    }

    const checkmailid = "SELECT * FROM users WHERE email = ?";

    conn.query(checkmailid, [email], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const sql =
            "INSERT INTO users (username, email, password, cpassword) VALUES (?, ?, ?, ?)";

        conn.query(sql, [username, email, password, cpassword], (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            return res.status(201).json({
                message: "User registered successfully"
            });

        });

    });

});



// =====================================
// START LAB
// =====================================
router.post("/start",auth, async function (req, res) {

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
router.post("/stop",auth, async function (req, res) {

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
