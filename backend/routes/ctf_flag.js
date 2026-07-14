const express = require("express");
const conn = require("../db");
const auth = require("./midd");

const router = express.Router();

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

router.post("/verify", auth, async (req, res) => {

    try {

        const { labId, userFlag } = req.body;
        const userId = req.user.id;

        // Check Request
        if (!labId || !userFlag) {
            return res.status(400).json({
                success: false,
                message: "Lab ID and Flag are required"
            });
        }

        // Find Lab
        const findFlag = await query(
            "SELECT * FROM ctf_flag WHERE lab_id = ?",
            [labId]
        );

        if (findFlag.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lab not found"
            });
        }

        // Verify Flag
        if (findFlag[0].flag !== userFlag) {
            return res.status(400).json({
                success: false,
                message: "Wrong Flag"
            });
        }

        // Check Already Solved
        const solved = await query(
            "SELECT * FROM solved_labs WHERE user_id = ? AND lab_id = ?",
            [userId, labId]
        );

        if (solved.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Lab already solved"
            });
        }

        // Insert into solved_labs
        await query(
            "INSERT INTO solved_labs (user_id, lab_id) VALUES (?, ?)",
            [userId, labId]
        );

        // Get XP
        const xp = findFlag[0].xp;

        // Update User XP
        await query(
            "UPDATE users SET total_xp = total_xp + ? WHERE id = ?",
            [xp, userId]
        );

        return res.json({
            success: true,
            message: "Lab Solved Successfully",
            xpEarned: xp
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

module.exports = router;