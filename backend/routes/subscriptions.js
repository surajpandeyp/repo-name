require("dotenv").config();
const Razorpay = require("razorpay");
const express = require("express");
const auth = require("./midd");
const crypto = require("crypto");
const conn = require("../db")
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.SECRET,

});

console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.SECRET);

router.post("/creat-order", auth, async(req,res) =>{


    try {
        const options = {
            amount:49900,
            currency:"INR",
            receipt:"monthy_plan"
        }

        const order = await razorpay.orders.create(options);

        return res.json({
            success:true,
            order
        })
    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success:false,
            message:"order creations field"
        })
    }
})







function query(sql, values = []) {
  return new Promise((resolve, reject) => {

    conn.query(sql, values, function(err, rows) {

      if (err) reject(err);
      else resolve(rows);

    });

  });
}

router.post("/verify-payment", auth, async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.SECRET
        )
        .update(body)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid Signature"
      });

    }

    const userId = req.user.id;

    await query(
      `
      INSERT INTO subscriptions
      (
        user_id,
        plan_name,
        start_date,
        expiry_date
      )
      VALUES
      (
        ?,
        'monthly',
        NOW(),
        DATE_ADD(
          NOW(),
          INTERVAL 1 MONTH
        )
      )
      ON DUPLICATE KEY UPDATE
        plan_name='monthly',
        start_date=NOW(),
        expiry_date=DATE_ADD(
          NOW(),
          INTERVAL 1 MONTH
        )
      `,
      [userId]
    );

    return res.json({
      success: true,
      message:
        "Subscription Activated"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});





module.exports = router;