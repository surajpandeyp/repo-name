const express = require("express");
const conn = require("../db");
const auth = require("./midd"); // Tumhara auth middleware
const router = express.Router();

// Database Promise Wrapper (Jo tum use kar rahe ho)
function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// 🌐 POST API: http://localhost:3000/api/pivoting-labs
router.post("/verify", auth, async (req, res) => {
    const userId = req.user?.id; // Logged-in user ki ID middleware se mili
    const { labIds } = req.body;  // Frontend se bheja gaya array: ['ctf-1', 'ctf-2', ...]

    // 1. Validation: Check karo ki frontend ne array sahi se bheja hai ya nahi
    if (!labIds || !Array.isArray(labIds) || labIds.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "array required" 
        });
    }

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "User authorized" 
        });
    }

    try {
        // 2. Query A: Har lab ko total kitne users ne solve kiya (GROUP BY + IN operator)
        // Ye ek hi baar me saari unique user entries count kar lega unhi 10 labs ke liye
        const solvesCountList = await query(
            "SELECT lab_id, COUNT(DISTINCT user_id) AS total_users FROM solved_labs WHERE lab_id IN (?) GROUP BY lab_id",
            [labIds]
        );

        // 3. Query B: Current user ne in 10 me se kaun-kaun si labs solve kar rakhi hain
        const userSolvedList = await query(
            "SELECT lab_id FROM solved_labs WHERE user_id = ? AND lab_id IN (?)",
            [userId, labIds]
        );

        // --- DATA MATCHING IN MEMORY (Fastest Way) ---

        // Solves list ko object map me convert karo. Example: { "ctf-1": 200, "ctf-2": 5 }
        const solvesMap = {};
        solvesCountList.forEach(row => {
            solvesMap[row.lab_id] = row.total_users;
        });

        // User ki solved lab IDs ko JavaScript 'Set' me daal lo taaki search instant (O(1)) ho
        const userSolvedSet = new Set(userSolvedList.map(row => row.lab_id));

        // 4. Final Response Array banao usi order me jis order me frontend ne IDs bheji thin
        const responseData = labIds.map(id => {
            const totalUsersSolved = solvesMap[id] || 0; // Agar koi solve nahi kiya toh 0
            const progressStatus = userSolvedSet.has(id) ? "Completed" : "Not Completed";

            return {
                id: id,
                usersSolvedCount: totalUsersSolved,
                progress: progressStatus
            };
        });

        // 5. Frontend ko ready-made clean data return karo
        return res.status(200).json({
            success: true,
            labs: responseData
        });

    } catch (error) {
        console.error("Database Error on Pivoting Labs:", error);
        // Error aane par response 500 status code ke sath bhejo taaki frontend hang na ho
        return res.status(500).json({ 
            success: false, 
            message: "Database error aa gaya bhai backend me!" 
        });
    }
});

module.exports = router;