// backend/routes/reports.js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

const router = express.Router();

function monthLabel(d = new Date()) {
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

/**
 * Seed basic ready-made reports if table is empty (optional but useful)
 */
async function seedIfEmpty() {
  const [[cnt]] = await pool.query(`SELECT COUNT(*) AS c FROM generated_reports`);
  if (Number(cnt.c || 0) > 0) return;

  const period = monthLabel(new Date());

  const base = [
    {
      report_key: "children_overview",
      title: "All Children Overview Report",
      description: "Summary of all children including demographics, health status, and placement.",
      category: "Children",
      subcategory: "Summary Reports",
      period_label: period,
      format: "PDF",
      status: "Ready",
      pages: 12,
      file_size_kb: 2500,
      meta: { type: "Overview" },
    },
    {
      report_key: "health_summary",
      title: "Health Status Summary Report",
      description: "Aggregated health data for all children including upcoming check-ups.",
      category: "Children",
      subcategory: "Summary Reports",
      period_label: period,
      format: "PDF",
      status: "Ready",
      pages: 8,
      file_size_kb: 1800,
      meta: { type: "Health Summary" },
    },
    {
      report_key: "development_overview",
      title: "Overall Development Progress Report",
      description: "Comprehensive analysis of development milestones across all children.",
      category: "Development",
      subcategory: "Summary Reports",
      period_label: period,
      format: "PDF",
      status: "Ready",
      pages: 18,
      file_size_kb: 3200,
      meta: { type: "Development Overview" },
    },
    {
      report_key: "donations_summary",
      title: "Donation Summary Report",
      description: "Overview of donations including trends, top donors, and fund allocation.",
      category: "Financial",
      subcategory: "Donation Reports",
      period_label: period,
      format: "PDF",
      status: "Ready",
      pages: 11,
      file_size_kb: 2100,
      meta: { type: "Donation Summary" },
    },
    {
      report_key: "annual_summary",
      title: "Annual Summary Report",
      description: "Year-end summary covering major areas of operations.",
      category: "System",
      subcategory: "Annual Reports",
      period_label: String(new Date().getFullYear()),
      format: "PDF",
      status: "Ready",
      pages: 35,
      file_size_kb: 5200,
      meta: { type: "Annual Summary" },
    },
  ];

  const values = base.map((r) => [
    r.report_key,
    r.title,
    r.description,
    r.category,
    r.subcategory,
    r.period_label,
    r.status,
    r.format,
    null,
    r.file_size_kb,
    r.pages,
    null,
    null,
    null,
    JSON.stringify(r.meta || {}),
  ]);

  await pool.query(
    `INSERT INTO generated_reports
     (report_key, title, description, category, subcategory, period_label, status, format, file_url, file_size_kb, pages, child_id,
      generated_by, generated_by_name, meta)
     VALUES ?`,
    [values]
  );
}

/**
 * GET /api/reports
 * query: q, category
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    await seedIfEmpty();

    const q = String(req.query.q || "").trim().toLowerCase();
    const category = String(req.query.category || "all");

    const where = [];
    const params = [];

    if (q) {
      where.push(`(
        LOWER(title) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(description,'')) LIKE CONCAT('%', ?, '%')
        OR LOWER(COALESCE(subcategory,'')) LIKE CONCAT('%', ?, '%')
      )`);
      params.push(q, q, q);
    }

    if (category !== "all") {
      where.push("category = ?");
      params.push(category);
    }

    const [rows] = await pool.query(
      `
      SELECT r.*, 
        c.first_name, c.middle_name, c.last_name
      FROM generated_reports r
      LEFT JOIN children c ON c.id = r.child_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT 500
      `,
      params
    );

    const reports = rows.map((r) => {
      const childName = r.child_id
        ? `${r.first_name || ""} ${r.middle_name ? r.middle_name + " " : ""}${r.last_name || ""}`.trim()
        : null;

      return {
        id: r.id,
        reportKey: r.report_key,
        title: r.title,
        description: r.description || "",
        category: r.category,
        subcategory: r.subcategory || "",
        period: r.period_label || "",
        status: r.status,
        format: r.format,
        fileUrl: r.file_url,
        fileSize: r.file_size_kb ? `${(Number(r.file_size_kb) / 1024).toFixed(1)} MB` : null,
        pages: r.pages || null,
        childId: r.child_id,
        childName,
        generatedAt: r.created_at,
        meta: (() => {
          try { return r.meta ? JSON.parse(r.meta) : {}; } catch { return {}; }
        })(),
      };
    });

    res.json({ success: true, reports });
  } catch (e) {
    console.error("GET /reports:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/reports/:id/view
 * Logs the action (you can also return the report file URL)
 */
router.post("/:id/view", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [[r]] = await pool.query(`SELECT * FROM generated_reports WHERE id=?`, [id]);
    if (!r) return res.status(404).json({ success: false, message: "Report not found" });

    await logAudit(req, {
      action: "VIEW",
      module: "Reports",
      resource: "Report",
      resourceId: id,
      details: `Viewed report: ${r.title}`,
      severity: "info",
    });

    res.json({ success: true, fileUrl: r.file_url || null });
  } catch (e) {
    console.error("POST /reports/:id/view:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [[r]] = await pool.query(`SELECT * FROM generated_reports WHERE id=?`, [id]);
    if (!r) return res.status(404).json({ success: false, message: "Report not found" });

    await logAudit(req, {
      action: "DOWNLOAD",
      module: "Reports",
      resource: "Report",
      resourceId: id,
      details: `Downloaded report: ${r.title}`,
      severity: "info",
    });

    // If you store files: redirect / stream here.
    res.json({ success: true, fileUrl: r.file_url || null });
  } catch (e) {
    console.error("POST /reports/:id/download:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/print", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [[r]] = await pool.query(`SELECT * FROM generated_reports WHERE id=?`, [id]);
    if (!r) return res.status(404).json({ success: false, message: "Report not found" });

    await logAudit(req, {
      action: "PRINT",
      module: "Reports",
      resource: "Report",
      resourceId: id,
      details: `Printed report: ${r.title}`,
      severity: "info",
    });

    res.json({ success: true });
  } catch (e) {
    console.error("POST /reports/:id/print:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/share", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [[r]] = await pool.query(`SELECT * FROM generated_reports WHERE id=?`, [id]);
    if (!r) return res.status(404).json({ success: false, message: "Report not found" });

    await logAudit(req, {
      action: "SHARE",
      module: "Reports",
      resource: "Report",
      resourceId: id,
      details: `Shared report: ${r.title}`,
      severity: "info",
    });

    res.json({ success: true });
  } catch (e) {
    console.error("POST /reports/:id/share:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
