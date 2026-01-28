const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

    /* =========================
    GET ALL USERS
    ========================= */
    router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
        "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
        );

        res.json(rows);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ message: "Server error" });
    }
    });

    /* =========================
    CREATE USER
    ========================= */
    router.post("/", async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        if (!name || !email || !role || !password) {
        return res.status(400).json({ message: "All fields required" });
        }

        // Check duplicate email
        const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
        );

        if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, hashed, role]
        );

        res.json({
        id: result.insertId,
        name,
        email,
        role,
        });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Server error" });
    }
    });

    /* =========================
    UPDATE USER (NO PASSWORD)
    ========================= */
    router.put("/:id", async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const { id } = req.params;

        await db.query(
        "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, id]
        );

        res.json({ message: "User updated" });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: "Server error" });
    }
    });

    /* =========================
    DELETE USER
    ========================= */
    router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({ message: "User deleted" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
