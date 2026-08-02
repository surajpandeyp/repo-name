const express = require("express");
const router = express.Router();
const conn = require("../db");
const auth = require("./midd");

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        conn.query(sql, values, function (err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}



router.post("/feedback", auth, async (req, res) => {
    const { rating, message } = req.body;
    
    // Auth middleware se user ki ID nikal rahe hain (Token ke hisaab se check kar lena ki req.user.id hai ya req.user.userId)
    const userId = req.user.id; 

    if (!rating || !message) {
        return res.status(400).json({ error: "Rating and message fields are required" });
    }

    try {
        await query(
            "INSERT INTO feedbacks (user_id, rating, message) VALUES (?, ?, ?)",
            [userId, rating, message]
        );
        
        return res.status(201).json({ message: "Feedback saved successfully with user ID!" });
    } catch (error) {
        console.error("Error saving feedback:", error);
        return res.status(500).json({ error: "Error saving feedback" });
    }
});



module.exports = router;