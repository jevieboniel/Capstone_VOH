// backend/utils/realtimeNotify.js
const db = require("../db");

const normRole = (r) => String(r || "").trim().toLowerCase();

/**
 * Only emits if enabled in notification_settings table.
 *
 * @param {import("socket.io").Server} io
 * @param {Object} payload
 * @param {string} payload.type        // MUST match notification_settings.type (e.g. "Donation Alerts")
 * @param {string} payload.title
 * @param {string} payload.message
 * @param {string} [payload.severity]  // "info" | "warning" | "error"
 * @param {Object} [target]
 * @param {string} [target.role]           // emits to room: role:<role>
 * @param {string[]} [target.roles]        // emits to MANY roles
 * @param {number|string} [target.userId]  // emits to room: user:<id>
 */
async function emitIfEnabled(io, payload, target = {}) {
  try {
    if (!io || !payload?.type) return;

    const [rows] = await db.query(
      "SELECT enabled FROM notification_settings WHERE type = ? LIMIT 1",
      [payload.type]
    );

    const enabled = !!rows?.[0]?.enabled;
    if (!enabled) return;

    const data = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type: payload.type,
      title: payload.title || "Notification",
      message: payload.message || "",
      severity: payload.severity || "info",
      createdAt: new Date().toISOString(),
    };

    // ✅ Single user
    if (target.userId) {
      io.to(`user:${target.userId}`).emit("notification:new", data);
      return;
    }

    // ✅ Multiple roles
    if (Array.isArray(target.roles) && target.roles.length) {
      for (const r of target.roles) {
        const rr = normRole(r);
        if (!rr) continue;
        io.to(`role:${rr}`).emit("notification:new", data);
      }
      return;
    }

    // ✅ Single role
    if (target.role) {
      const rr = normRole(target.role);
      if (rr) io.to(`role:${rr}`).emit("notification:new", data);
      return;
    }

    // ✅ Everyone
    io.emit("notification:new", data);
  } catch (e) {
    console.error("emitIfEnabled error:", e?.message || e);
  }
}

module.exports = { emitIfEnabled };
