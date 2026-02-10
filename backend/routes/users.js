const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

// -------------------------
// Multer setup (avatars)
// -------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `avatar_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// -------------------------
// Helpers
// -------------------------
const mapUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status || "Active",
  phone: u.phone || "",
  avatarUrl: u.avatar_url || "",
  permissions: (() => {
    try {
      return u.permissions ? JSON.parse(u.permissions) : [];
    } catch {
      return [];
    }
  })(),
  createdAt: u.created_at || null,
  lastLogin: u.last_login || null,
});

/* =========================
  GET ALL USERS (Admin only)
========================= */
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, email, role, status, phone, avatar_url, permissions, created_at, last_login
      FROM users
      ORDER BY id DESC
    `);
    res.json(rows.map(mapUser));
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
  CREATE USER (Admin only)
========================= */
router.post("/", verifyToken, requireAdmin, upload.single("avatar"), async (req, res) => {
  try {
    // multipart => values are strings
    const body = req.body || {};

    const name = body.name;
    const email = body.email;
    const role = body.role;
    const password = body.password;
    const phone = body.phone;
    const status = body.status;
    const permissions =
      body.permissions !== undefined
        ? (() => {
            try {
              return typeof body.permissions === "string" ? JSON.parse(body.permissions) : body.permissions;
            } catch {
              return [];
            }
          })()
        : [];

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);

    // ✅ if avatar uploaded
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : (body.avatar_url || null);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, status, permissions, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        email,
        hashed,
        role,
        phone || null,
        status || "Active",
        JSON.stringify(permissions || []),
        avatar_url,
      ]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "User Management",
        resource: "User",
        resourceId: result.insertId,
        details: `Created user: ${email} (${role})`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (CREATE user):", e);
    }

    const user = {
      id: result.insertId,
      name,
      email,
      role,
      status: status || "Active",
      phone: phone || "",
      avatarUrl: avatar_url || "",
      permissions: permissions || [],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
  ✅ UPDATE USER (Admin OR Self)
  PUT /api/users/:id
  - supports JSON OR multipart (avatar upload)
========================= */
router.put("/:id", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;

    const isAdmin = (req.user.role || "").toLowerCase() === "admin";
    const isSelf = String(req.user.id) === String(id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const body = req.body || {};

    const name = body.name;
    const email = body.email;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // ✅ only admin can change these
    const role = body.role;
    const status = body.status;
    const permissionsRaw = body.permissions;

    if (!isAdmin && (role || status || permissionsRaw)) {
      return res.status(403).json({ message: "Only admin can update role/status/permissions." });
    }

    const phone = body.phone;

    // ✅ if avatar uploaded
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : body.avatar_url;

    // ✅ permissions can arrive as string JSON in FormData
    let permissions = undefined;
    if (permissionsRaw !== undefined) {
      try {
        permissions = typeof permissionsRaw === "string" ? JSON.parse(permissionsRaw) : permissionsRaw;
      } catch {
        permissions = [];
      }
    }

    const fields = [];
    const values = [];

    fields.push("name = ?"); values.push(name);
    fields.push("email = ?"); values.push(email);

    if (role !== undefined) { fields.push("role = ?"); values.push(role); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone || null); }
    if (avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(avatar_url || null); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status || "Active"); }
    if (permissions !== undefined) { fields.push("permissions = ?"); values.push(JSON.stringify(permissions || [])); }

    values.push(id);

    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "User Management",
        resource: "User",
        resourceId: id,
        details: `Updated user: ${email}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE user):", e);
    }

    const [rows] = await db.query(
      `SELECT id, name, email, role, status, phone, avatar_url, permissions, created_at, last_login
      FROM users WHERE id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully.", user: mapUser(rows[0]) });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
  ✅ UPDATE PROFILE (Admin OR Self) - multipart
  PUT /api/users/:id/profile
========================= */
router.put("/:id/profile", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;

    const isAdmin = (req.user.role || "").toLowerCase() === "admin";
    const isSelf = String(req.user.id) === String(id);

    if (!isAdmin && !isSelf) return res.status(403).json({ message: "Forbidden" });

    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      role,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const name = `${firstName || ""} ${middleName || ""} ${lastName || ""}`.replace(/\s+/g, " ").trim();
    if (!name || !email) return res.status(400).json({ message: "Name and email are required." });

    if (!isAdmin && role) return res.status(403).json({ message: "Only admin can update role." });

    const avatar_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    let newHash = null;
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New password and confirmation do not match." });
      }

      const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [id]);
      if (!rows.length) return res.status(404).json({ message: "User not found" });

      if (!isAdmin) {
        if (!currentPassword) return res.status(400).json({ message: "Current password is required." });
        const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!ok) return res.status(400).json({ message: "Current password is incorrect." });
      }

      newHash = await bcrypt.hash(newPassword, 10);
    }

    const fields = [];
    const values = [];

    fields.push("name = ?"); values.push(name);
    fields.push("email = ?"); values.push(email);
    fields.push("phone = ?"); values.push(phone || null);

    if (isAdmin && role) { fields.push("role = ?"); values.push(role); }
    if (avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(avatar_url); }
    if (newHash) { fields.push("password_hash = ?"); values.push(newHash); }

    values.push(id);

    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    // NOTE: Keeping your request exactly: audit after UPDATE user (this profile route also updates the user)
    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "User Management",
        resource: "User",
        resourceId: id,
        details: `Updated user: ${email}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE user profile):", e);
    }

    const [updatedRows] = await db.query(
      `SELECT id, name, email, role, status, phone, avatar_url, permissions, created_at, last_login
      FROM users WHERE id = ?`,
      [id]
    );
    if (!updatedRows.length) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully.", user: mapUser(updatedRows[0]) });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
  UPDATE PASSWORD (Admin OR Self)
========================= */
router.put("/:id/password", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const isAdmin = (req.user.role || "").toLowerCase() === "admin";
    const isSelf = String(req.user.id) === String(id);

    if (!isAdmin && !isSelf) return res.status(403).json({ message: "Unauthorized action." });

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ message: "New password required." });
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }

    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    if (!isAdmin) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required." });
      const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!ok) return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, id]);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
  TOGGLE STATUS (Admin only)
========================= */
router.patch("/:id/toggle-status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT status FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const newStatus = rows[0].status === "Active" ? "Suspended" : "Active";
    await db.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, id]);

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "User Management",
        resource: "User Status",
        resourceId: id,
        details: `Toggled user status to ${newStatus}`,
        severity: newStatus === "Suspended" ? "warning" : "info",
      });
    } catch (e) {
      console.error("Audit log failed (TOGGLE user status):", e);
    }

    res.json({ message: "Status updated", status: newStatus });
  } catch (err) {
    console.error("Toggle status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
  DELETE USER (Admin only)
========================= */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    try {
      await logAudit(req, {
        action: "DELETE",
        module: "User Management",
        resource: "User",
        resourceId: id,
        details: "Deleted user account",
        severity: "warning",
      });
    } catch (e) {
      console.error("Audit log failed (DELETE user):", e);
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
