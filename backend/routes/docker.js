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



router.post("/start/pivoting", auth, async function (req, res) {

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
            "SELECT * FROM pivoting WHERE lab_id = ?",
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
             FROM pivoting_containers
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




router.post("/sta",auth, async function (req, res) {

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
//=================

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


router.post("/auth", (req, res) => {
  const authheader = req.headers.authorization;

  if (!authheader) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authheader.split(" ")[1];

  try {
    const decode = jwt.verify(token, "suraj123456");

    req.user = decode;

    return res.status(200).json({
      success: true,
      user: decode
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token"
    });
  }
});

module.exports = router;
