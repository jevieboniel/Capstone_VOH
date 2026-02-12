// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const pool = require("../db");

function safeParse(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return txt ? [txt] : [];
  }
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Always refresh user from DB (role/status/permissions may change)
    const [rows] = await pool.query(
      "SELECT id, email, role, name, status, permissions FROM users WHERE id=? LIMIT 1",
      [decoded.id]
    );

    if (!rows.length) return res.status(401).json({ success: false, message: "User not found" });

    const u = rows[0];

    if (u.status && u.status !== "Active") {
      return res.status(403).json({ success: false, message: `Account is ${u.status}` });
    }

    req.user = {
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      permissions: u.permissions ? safeParse(u.permissions) : [],
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  next();
};

module.exports = { verifyToken, requireAdmin };
