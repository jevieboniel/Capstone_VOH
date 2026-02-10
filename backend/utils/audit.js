// backend/utils/audit.js
const pool = require("../db");

function getIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || null;
}

async function logAudit(req, {
  action,
  module,
  resource = null,
  resourceId = null,
  details = null,
  severity = "info",
  meta = null,
  userOverride = null, // optional {id,name,role}
}) {
  try {
    const u = userOverride || req.user || {};

    const user_id = u?.id ?? null;
    const user_name = u?.name ?? null;
    const user_role = u?.role ?? null;

    const ip_address = getIp(req);
    const user_agent = req.headers["user-agent"] || null;

    await pool.query(
      `INSERT INTO audit_trail
        (user_id, user_name, user_role, action, module, resource, resource_id, details, ip_address, user_agent, severity, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        user_name,
        user_role,
        String(action || "").toUpperCase(),
        module,
        resource,
        resourceId ? String(resourceId) : null,
        details,
        ip_address,
        user_agent,
        severity,
        meta ? JSON.stringify(meta) : null,
      ]
    );
  } catch (e) {
    // never break the request if audit fails
    console.error("Audit log failed:", e.message);
  }
}

module.exports = { logAudit };
