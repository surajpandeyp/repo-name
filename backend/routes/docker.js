const express = require("express");
const Docker = require("dockerode");
const conn = require("../db")
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("./midd");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // <-- Mail ke liye import kiya

const docker = new Docker({
    socketPath: "/var/run/docker.sock"
});

// Nodemailer Transporter Setup (Apna email aur app password yahan daalna)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'amitg123448@gmail.com',       // Apna Gmail ID
        pass: 'cqyz jzkr unyu badh'     // Gmail App Password (Normal password nahi chalega)
    }
});

//==========================
// login api
//==========================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password Required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    conn.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid Email or Password" });
        }

        const user = results[0];

        // Check if user verified their email via OTP
        if (user.is_verified === 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Please verify your email using OTP first." 
            });
        }

        // Bcrypt se password verify karo
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Token generate karo
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username},
            process.env.JWT_SECRET || "suraj123456", 
            { expiresIn: "1h" }
        );

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
    });
});


//=====================================
// REGISTER API (OTP SEND KAREGA)
//=====================================
router.post("/register", async (req, res) => {
    const { username, email, password, cpassword } = req.body;

    // 1. Basic Fields Check
    if (!username || !email || !password || !cpassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Password Match Check
    if (password !== cpassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3. Password Complexity Validation (Regex)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "Password must be at least 8 chars long, contain 1 uppercase, 1 number, and 1 special character." 
        });
    }

    const checkmailid = "SELECT * FROM users WHERE email = ?";

    conn.query(checkmailid, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (result.length > 0) {
            if (result[0].is_verified === 1) {
                return res.status(400).json({ message: "Email already registered" });
            } else {
                // Agar pehle se entry hai par verify nahi hua, toh purana record delete ya update kar sakte hain
                // Filhal hum error ya update handle kar sakte hain. Simple rakhne ke liye message de dete hain:
                return res.status(400).json({ message: "OTP already sent. Please verify your email." });
            }
        }

        try {
            // 4. Password Hashing (Bcrypt)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 5. Generate 6-digit OTP & Expiry (10 minutes)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            // Insert unverified user with OTP into DB (is_verified = 0)
            const sql = "INSERT INTO users (username, email, password, otp, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, 0)";

            conn.query(sql, [username, email, hashedPassword, otp, otpExpiry], async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Database error during registration" });
                }

                // Send Email with OTP
                const mailOptions = {
                    from: 'tera_email@gmail.com',
                    to: email,
                    subject: 'Email Verification OTP - Lab Portal',
                    text: `Hello ${username},\n\nYour OTP for registration is: ${otp}\nThis OTP is valid for 10 minutes.\n\nRegards,\nTeam`
                };

                await transporter.sendMail(mailOptions);

                return res.status(201).json({ 
                    message: "Registration successful! Please check your email for the OTP." 
                });
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server error during registration" });
        }
    });
});


//=====================================
// VERIFY OTP API
//=====================================
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const queryStr = "SELECT * FROM users WHERE email = ?";
    conn.query(queryStr, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        if (user.is_verified === 1) {
            return res.status(400).json({ message: "User already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ message: "OTP has expired. Please register again." });
        }

        // Mark user as verified and clear OTP fields
        const updateQuery = "UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?";
        conn.query(updateQuery, [email], (err, updateResult) => {
            if (err) return res.status(500).json({ message: "Database error during verification" });

            return res.status(200).json({ 
                success: true,
                message: "Email verified successfully! You can now log in." 
            });
        });
    });
});


// =====================================
// AUTH CHECK API
// =====================================
router.post("/auth", (req, res) => {
  const authheader = req.headers.authorization;

  if (!authheader) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authheader.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET || "suraj123456");

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