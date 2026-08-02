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


// Express Route: GET /api/my-subscription
// Note: Isme aapka 'checkAuth' middleware hona chahiye taaki 'req.user.id' mil sake.

router.get("/my-subscription", auth, async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user ki ID token se aayegi
    const currentDate = new Date();

    // Query: Check karegi ki is user ka koi plan active hai ya nahi (expiry date aaj se badi honi chahiye)
    const rows = await query(
      "SELECT plan_name, start_date, expiry_date FROM subscriptions WHERE user_id = ? AND expiry_date > ? ORDER BY expiry_date DESC LIMIT 1",
      [userId, currentDate]
    );

    if (rows.length > 0) {
      // User ke paas active subscription hai
      return res.status(200).json({
        subscribed: true,
        plan: rows[0].plan_name,
        startDate: rows[0].start_date,
        expiryDate: rows[0].expiry_date,
      });
    } else {
      // User ke paas active subscription nahi hai
      return res.status(200).json({
        subscribed: false,
        message: "No active subscription found or plan expired."
      });
    }
  } catch (error) {
    console.error("Subscription fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router