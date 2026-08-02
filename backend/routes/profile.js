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

router.get("/profile", auth, async (req, res) => {
    // Auth middleware se safely values nikalna
    const user = req.user?.username || "Guest";
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "User authorized nahi hai!" });
    }

    try {
        // 1. users table se data nikalna (Yahan 'total_xp' use kiya hai jo tumhare table me hai)
        const findXp = await query(
            "SELECT total_xp FROM users WHERE id = ?", [userId]
        );
        // Table me jo column hai use extract karo: findXp[0].total_xp
        const totleXp = findXp[0]?.total_xp !== undefined ? `${findXp[0].total_xp} XP` : "0 XP";

        // 2. solved_labs table se count nikalna
        const findCountlab = await query(
            "SELECT COUNT(*) AS total_solved FROM solved_labs WHERE user_id = ?", [userId]
        );
        const totleCountLab = findCountlab[0]?.total_solved || 0;

        // 3. Flags count (Agar abhi flags ke liye alag table nahi hai, toh abhi ke liye total_solved ko hi flags maan sakte hain ya 0 bhej sakte hain)
        const totleFlag = totleCountLab; // Jab flags ki alag table banaoge, tab query badal lena

        // API Response bhejna
        return res.status(200).json({
            success: true,
            totleFlag: totleFlag,
            totleXp: totleXp,
            user: user,
            totleCountLab: totleCountLab
        });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ success: false, message: "Database error aa gaya bhai!" });
    } 
});

module.exports = router;