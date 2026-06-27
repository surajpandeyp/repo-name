require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const conn = require("../db")


const router = express.Router()

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.Email_user,
        pass:process.env.Email_pass
    }
})




router.post("/forgot-password", (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email Required"
        });
    }

    conn.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, users) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User Not Found"
                });
            }

            const user = users[0];

            const token =
                crypto.randomBytes(32).toString("hex");

            const expiry =
                new Date(Date.now() + 3600000);

            conn.query(
                `INSERT INTO password_resets
                (user_id, token, expires_at)
                VALUES (?, ?, ?)`,
                [user.id, token, expiry],
                async (err) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: err.message
                        });
                    }

                    const resetLink =
                        `http://localhost:5173/reset-password/${token}`;

                    await transporter.sendMail({
                        from: "yourmail@gmail.com",
                        to: user.email,
                        subject: "Password Reset",
                        html: `
                        <h2>Password Reset</h2>
                        <p>Click below link:</p>
                        <a href="${resetLink}">
                            Reset Password
                        </a>
                        `
                    });

                    return res.json({
                        success: true,
                        message: "Reset Link Sent"
                    });
                }
            );
        }
    );
});





router.get("/verify-token/:token", (req, res) => {

    const token = req.params.token;

    conn.query(
        `SELECT *
        FROM password_resets
        WHERE token = ?
        AND expires_at > NOW()`,
        [token],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            if (rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Token"
                });
            }

            return res.json({
                success: true
            });
        }
    );
});




router.post("/reset-password", (req, res) => {

    const { token, password } = req.body;

    conn.query(
        `SELECT *
        FROM password_resets
        WHERE token = ?
        AND expires_at > NOW()`,
        [token],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            if (rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Token Expired"
                });
            }

            const resetRow = rows[0];

            conn.query(
                `UPDATE users
                 SET password = ?
                 WHERE id = ?`,
                [password, resetRow.user_id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            success: false
                        });
                    }

                    conn.query(
                        `DELETE FROM password_resets
                         WHERE token = ?`,
                        [token]
                    );

                    return res.json({
                        success: true,
                        message: "Password Updated"
                    });
                }
            );
        }
    );
});

module.exports = router;