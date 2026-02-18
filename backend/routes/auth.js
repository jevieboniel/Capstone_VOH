// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

const { emitIfEnabled } = require("../utils/realtimeNotify"); // ✅ NEW

const router = express.Router();

function safeParse(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return txt ? [txt] : [];
  }
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, error: "Invalid email or password" });

    const user = rows[0];

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, error: `Account is ${user.status}` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, error: "Invalid email or password" });

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Audit LOGIN (use override because req.user not set yet)
    await logAudit(req, {
      action: "LOGIN",
      module: "Authentication",
      resource: "System Access",
      resourceId: `user_${user.id}`,
      details: "User logged into the system",
      severity: "info",
      userOverride: { id: user.id, name: user.name, role: user.role },
    });

    // ✅ REALTIME: User Activity
    const io = req.app.get("io");
    await emitIfEnabled(
      io,
      {
        type: "User Activity",
        title: "User Logged In",
        message: `${user.name} (${user.role}) logged in.`,
        severity: "info",
      },
      { role: "Admin" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        permissions: user.permissions ? safeParse(user.permissions) : [],
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: "User not found" });

    const u = rows[0];

    return res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        phone: u.phone,
        avatarUrl: u.avatar_url,
        permissions: u.permissions ? safeParse(u.permissions) : [],
        createdAt: u.created_at,
        lastLogin: u.last_login,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
