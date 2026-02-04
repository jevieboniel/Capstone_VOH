const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  const role = (req.user?.role || "").toLowerCase();
  if (role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  next();
};

module.exports = { verifyToken, requireAdmin };
