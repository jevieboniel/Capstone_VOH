// backend/routes/auditTrail.js
const express = require("express");
const pool = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

const router = express.Router();

function isAdminRole(req) {
  return String(req.user?.role || "").toLowerCase() === "admin";
}

/**
 * GET /api/audit-trail
 * query:
 *  - q
 *  - module
 *  - action
 *  - limit (default 200)
 *
 * ✅ Admin: sees all logs
 * ✅ Other roles: sees ONLY their own logs
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const moduleFilter = String(req.query.module || "all");
    const actionFilter = String(req.query.action || "all").toUpperCase();
    const limit = Math.min(Number(req.query.limit || 200), 1000);

    const where = [];
    const params = [];

    // ✅ Non-admin: only own logs
    if (!isAdminRole(req)) {
      where.push("user_id = ?");
      params.push(req.user.id);
    }

    if (q) {
      where.push(`(
        LOWER(COALESCE(user_name,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(details,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(resource,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(resource_id,'')) LIKE CONCAT('%', ?, '%')
      )`);
      params.push(q, q, q, q);
    }

    if (moduleFilter !== "all") {
      where.push("module = ?");
      params.push(moduleFilter);
    }

    if (actionFilter !== "ALL" && actionFilter !== "all") {
      where.push("action = ?");
      params.push(actionFilter);
    }

    const sql = `
      SELECT *
      FROM audit_trail
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `;

    params.push(limit);

    const [rows] = await pool.query(sql, params);

    // ✅ stats should match what user can see
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const baseParams = params.slice(0, params.length - 1); // remove LIMIT param

    const [[todayRow]] = await pool.query(
      `
      SELECT COUNT(*) AS todayCount
      FROM audit_trail
      ${whereSql ? whereSql + " AND" : "WHERE"} DATE(created_at) = CURDATE()
      `,
      baseParams
    );

    const [[criticalRow]] = await pool.query(
      `
      SELECT COUNT(*) AS criticalCount
      FROM audit_trail
      ${whereSql ? whereSql + " AND" : "WHERE"} severity IN ('warning','error','critical')
        AND DATE(created_at) = CURDATE()
      `,
      baseParams
    );

    const [[activeUsersRow]] = await pool.query(
      `
      SELECT COUNT(DISTINCT user_id) AS activeUsers
      FROM audit_trail
      ${whereSql ? whereSql + " AND" : "WHERE"} DATE(created_at) = CURDATE()
      `,
      baseParams
    );

    res.json({
      success: true,
      entries: rows,
      stats: {
        todayCount: Number(todayRow.todayCount || 0),
        criticalCount: Number(criticalRow.criticalCount || 0),
        activeUsers: Number(activeUsersRow.activeUsers || 0),
      },
    });
  } catch (e) {
    console.error("GET /audit-trail:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/audit-trail/export.csv
 * ✅ Keep admin-only (recommended)
 */
router.get("/export.csv", verifyToken, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const moduleFilter = String(req.query.module || "all");
    const actionFilter = String(req.query.action || "all").toUpperCase();

    const where = [];
    const params = [];

    if (q) {
      where.push(`(
        LOWER(COALESCE(user_name,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(details,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(resource,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(resource_id,'')) LIKE CONCAT('%', ?, '%')
      )`);
      params.push(q, q, q, q);
    }

    if (moduleFilter !== "all") {
      where.push("module = ?");
      params.push(moduleFilter);
    }

    if (actionFilter !== "ALL" && actionFilter !== "all") {
      where.push("action = ?");
      params.push(actionFilter);
    }

    const sql = `
      SELECT created_at, user_name, user_role, action, module, resource, resource_id, details, ip_address, severity
      FROM audit_trail
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY created_at DESC, id DESC
      LIMIT 5000
    `;

    const [rows] = await pool.query(sql, params);

    const header = [
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Module",
      "Resource",
      "Resource ID",
      "Details",
      "IP Address",
      "Severity",
    ];

    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((r) =>
          [
            new Date(r.created_at).toISOString(),
            (r.user_name || "").replaceAll(",", " "),
            (r.user_role || "").replaceAll(",", " "),
            r.action,
            (r.module || "").replaceAll(",", " "),
            (r.resource || "").replaceAll(",", " "),
            (r.resource_id || "").replaceAll(",", " "),
            `"${String(r.details || "").replace(/"/g, '""')}"`,
            r.ip_address || "",
            r.severity || "info",
          ].join(",")
        )
        .join("\n");

    await logAudit(req, {
      action: "EXPORT",
      module: "Audit Trail",
      resource: "AuditTrail",
      details: "Exported audit trail CSV",
      severity: "info",
      meta: { q, module: moduleFilter, action: actionFilter },
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit_trail.csv");
    res.send(csv);
  } catch (e) {
    console.error("GET /audit-trail/export.csv:", e);
    res.status(500).json({ success: false, message: "Failed to export CSV" });
  }
});

module.exports = router;
