// backend/utils/realtimeNotify.js
const db = require("../db");

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
 * @param {string} [target.role]       // emits to room: role:<role>
 * @param {number|string} [target.userId] // emits to room: user:<id>
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

    if (target.userId) io.to(`user:${target.userId}`).emit("notification:new", data);
    else if (target.role) io.to(`role:${target.role}`).emit("notification:new", data);
    else io.emit("notification:new", data);
  } catch (e) {
    // never crash main flow
    console.error("emitIfEnabled error:", e?.message || e);
  }
}

module.exports = { emitIfEnabled };
