// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

/**
 * POST /api/auth/register
 * (Use once to create an admin user)
 */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing fields" });
        }

        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
        return res.status(409).json({ success: false, error: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, password_hash, role || "admin"]
        );

        return res.json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
    });

    /**
     * POST /api/auth/login
     */
    router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
        }

        const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        return res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
