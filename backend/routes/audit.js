const express = require("express");
const pool = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/audit?search=&module=&action=&limit=&offset=
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    const module = (req.query.module || "all").trim();
    const action = (req.query.action || "all").trim();

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const where = [];
    const params = [];

    if (search) {
      where.push(
        `(LOWER(user_name) LIKE ? OR LOWER(details) LIKE ? OR LOWER(resource) LIKE ? OR LOWER(resource_id) LIKE ?)`
      );
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (module !== "all") {
      where.push(`module = ?`);
      params.push(module);
    }
    if (action !== "all") {
      where.push(`action = ?`);
      params.push(action);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        id,
        created_at AS timestamp,
        user_id AS userId,
        user_name AS userName,
        user_role AS userRole,
        action,
        resource,
        resource_id AS resourceId,
        details,
        module,
        severity,
        ip_address AS ipAddress
      FROM audit_trail
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM audit_trail ${whereSql}`,
      params
    );

    res.json({ success: true, total: countRow.total, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/audit/export?search=&module=&action=
router.get("/export", verifyToken, requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    const module = (req.query.module || "all").trim();
    const action = (req.query.action || "all").trim();

    const where = [];
    const params = [];

    if (search) {
      where.push(
        `(LOWER(user_name) LIKE ? OR LOWER(details) LIKE ? OR LOWER(resource) LIKE ? OR LOWER(resource_id) LIKE ?)`
      );
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (module !== "all") {
      where.push(`module = ?`);
      params.push(module);
    }
    if (action !== "all") {
      where.push(`action = ?`);
      params.push(action);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        created_at AS timestamp,
        user_name AS user,
        user_role AS role,
        action,
        resource,
        resource_id AS resource_id,
        module,
        severity,
        details,
        ip_address
      FROM audit_trail
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT 5000
      `,
      params
    );

    const header = [
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Resource",
      "Resource ID",
      "Module",
      "Severity",
      "Details",
      "IP Address",
    ];

    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.timestamp,
          r.user,
          r.role,
          r.action,
          r.resource,
          r.resource_id,
          r.module,
          r.severity,
          r.details,
          r.ip_address,
        ]
          .map(escape)
          .join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="audit_trail.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
