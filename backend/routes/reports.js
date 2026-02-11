// backend/routes/reports.js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const router = express.Router();

const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // adjust if needed
const uploadDir = path.join(__dirname, "..", "uploads");
const reportsDir = path.join(uploadDir, "reports");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

function monthLabel(d = new Date()) {
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

function safeName(s) {
  return String(s || "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

function pdfPathToUrl(absPath) {
  const rel = absPath.split(path.join("uploads"))[1].replaceAll("\\", "/"); // windows safe
  return `${BASE_URL}/uploads${rel}`;
}

/**
 * GET /api/reports
 * query: q, category
 */
router.get("/", verifyToken, async (req, res) => {
  try {
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
      SELECT r.*, c.first_name, c.middle_name, c.last_name
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
 * POST /api/reports/generate
 * body: { reportKey, childId? }
 */
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const reportKey = String(req.body?.reportKey || "").trim();
    const childId = req.body?.childId ? Number(req.body.childId) : null;

    if (!reportKey) {
      return res.status(400).json({ success: false, message: "reportKey is required." });
    }

    // Decide report metadata
    let category = "System";
    let title = "Generated Report";
    let description = "System generated report";
    let subcategory = "Summary Reports";
    let periodLabel = monthLabel(new Date());

    if (reportKey === "children_overview") {
      category = "Children";
      title = "All Children Overview Report";
      description = "Summary of all children including demographics, health status, and placement.";
      subcategory = "Summary Reports";
    } else if (reportKey === "child_profile") {
      category = "Children";
      subcategory = "Child Reports";
      if (!childId) return res.status(400).json({ success: false, message: "childId is required for child_profile." });
    } else if (reportKey === "development_overview") {
      category = "Development";
      title = "Development Milestones Summary Report";
      description = "Summary of milestones and progress across children.";
      subcategory = "Summary Reports";
    } else if (reportKey === "donations_summary") {
      category = "Financial";
      title = "Donations Summary Report";
      description = "Overview of donation totals, trends, and purposes.";
      subcategory = "Donation Reports";
    } else if (reportKey === "houses_summary") {
      category = "Houses";
      title = "Houses Summary Report";
      description = "Overview of children distribution and house information.";
      subcategory = "Summary Reports";
    } else if (reportKey === "annual_summary") {
      category = "System";
      title = "Annual Summary Report";
      description = "Year-end summary covering major areas of operations.";
      subcategory = "Annual Reports";
      periodLabel = String(new Date().getFullYear());
    } else {
      return res.status(400).json({ success: false, message: "Unknown report type." });
    }

    // Fetch data per reportKey
    let childRow = null;

    if (reportKey === "child_profile") {
      const [[c]] = await pool.query(`SELECT * FROM children WHERE id=?`, [childId]);
      if (!c) return res.status(404).json({ success: false, message: "Child not found." });
      childRow = c;

      const childName = `${c.first_name || ""} ${c.middle_name ? c.middle_name + " " : ""}${c.last_name || ""}`.trim();
      title = `Child Profile Report: ${childName}`;
      description = "Single child profile including health and education summary.";

      // optional: get latest health/education summaries
    }

    // Create PDF file
    const filename =
      reportKey === "child_profile"
        ? `child_profile_${childId}_${Date.now()}_${safeName(title)}.pdf`
        : `${reportKey}_${Date.now()}_${safeName(title)}.pdf`;

    const absFile = path.join(reportsDir, filename);

    // Build PDF
    await new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(absFile);

        doc.pipe(stream);

        // Header
        doc.fontSize(18).text(title, { align: "left" });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#555").text(`Category: ${category}   •   Period: ${periodLabel}`);
        doc.moveDown(0.5);
        doc.fillColor("#000").fontSize(12).text(description);
        doc.moveDown(1);

        // Content per report
        if (reportKey === "children_overview") {
          const [rows] = await pool.query(`SELECT id, first_name, middle_name, last_name, age, gender, house, health_status, education_level, status FROM children ORDER BY id DESC LIMIT 200`);
          doc.fontSize(14).text(`Total children: ${rows.length}`);
          doc.moveDown(0.5);

          doc.fontSize(11);
          rows.forEach((r, i) => {
            const name = `${r.first_name || ""} ${r.middle_name ? r.middle_name + " " : ""}${r.last_name || ""}`.trim();
            doc.text(`${i + 1}. ${name} • Age: ${r.age} • ${r.gender} • House: ${r.house || "-"} • Health: ${r.health_status || "-"} • Edu: ${r.education_level || "-"} • Status: ${r.status || "-"}`);
          });
        }

        if (reportKey === "child_profile") {
          const c = childRow;
          const childName = `${c.first_name || ""} ${c.middle_name ? c.middle_name + " " : ""}${c.last_name || ""}`.trim();

          doc.fontSize(14).text("Child Information");
          doc.moveDown(0.5);
          doc.fontSize(11).text(`Name: ${childName}`);
          doc.text(`Age: ${c.age}   •   Gender: ${c.gender}`);
          doc.text(`House: ${c.house || "-"}   •   House Parent: ${c.house_parent || "-"}`);
          doc.text(`Health Status: ${c.health_status || "-"}`);
          doc.text(`Education Level: ${c.education_level || "-"}`);
          doc.text(`Status: ${c.status || "-"}`);
          doc.moveDown(1);

          // Health records (latest 5)
          const [health] = await pool.query(
            `SELECT record_type, provider, record_date, notes
             FROM health_records
             WHERE child_id=?
             ORDER BY record_date DESC, id DESC
             LIMIT 5`,
            [childId]
          );

          doc.fontSize(14).text("Recent Health Records");
          doc.moveDown(0.5);
          doc.fontSize(11);
          if (!health.length) doc.text("No health records found.");
          health.forEach((h, i) => {
            doc.text(`${i + 1}. ${h.record_type} • ${h.provider} • ${h.record_date ? new Date(h.record_date).toISOString().slice(0, 10) : ""}`);
            doc.text(`   Notes: ${String(h.notes || "").slice(0, 200)}`);
          });

          doc.moveDown(1);

          // Education summary
          const [[eduSum]] = await pool.query(
            `SELECT school, average_grade, honor
             FROM education_summaries
             WHERE child_id=?`,
            [childId]
          );

          doc.fontSize(14).text("Education Summary");
          doc.moveDown(0.5);
          doc.fontSize(11);
          doc.text(`School: ${eduSum?.school || "-"}`);
          doc.text(`Average Grade: ${eduSum?.average_grade ?? "-"}`);
          doc.text(`Honor: ${eduSum?.honor || "-"}`);

          doc.moveDown(1);

          // Education records (latest 5)
          const [eduRec] = await pool.query(
            `SELECT subject, grade, teacher, term
             FROM education_records
             WHERE child_id=?
             ORDER BY id DESC
             LIMIT 5`,
            [childId]
          );

          doc.fontSize(14).text("Recent Subjects");
          doc.moveDown(0.5);
          doc.fontSize(11);
          if (!eduRec.length) doc.text("No education records found.");
          eduRec.forEach((e, i) => {
            doc.text(`${i + 1}. ${e.subject} • Grade: ${e.grade} • Teacher: ${e.teacher} ${e.term ? `• Term: ${e.term}` : ""}`);
          });
        }

        if (reportKey === "development_overview") {
          const [[tot]] = await pool.query(`SELECT COUNT(*) AS c FROM milestones`);
          doc.fontSize(14).text(`Total milestones: ${Number(tot.c || 0)}`);
          doc.moveDown(0.5);

          const [rows] = await pool.query(
            `SELECT m.id, m.title, m.status, m.progress, m.created_date,
                    c.first_name, c.middle_name, c.last_name
             FROM milestones m
             JOIN children c ON c.id = m.child_id
             ORDER BY m.id DESC
             LIMIT 150`
          );

          doc.fontSize(11);
          rows.forEach((r, i) => {
            const name = `${r.first_name || ""} ${r.middle_name ? r.middle_name + " " : ""}${r.last_name || ""}`.trim();
            doc.text(`${i + 1}. ${r.title} • Child: ${name} • Status: ${r.status} • Progress: ${r.progress}%`);
          });
        }

        if (reportKey === "donations_summary") {
          const [[totals]] = await pool.query(
            `SELECT
              COALESCE(SUM(amount),0) AS totalAmount,
              COUNT(*) AS totalTransactions
             FROM donations
             WHERE status='Completed'`
          );

          doc.fontSize(14).text("Donation Totals");
          doc.moveDown(0.5);
          doc.fontSize(11).text(`Total Amount: PHP ${Number(totals.totalAmount || 0).toLocaleString()}`);
          doc.text(`Transactions: ${Number(totals.totalTransactions || 0)}`);
          doc.moveDown(1);

          const [byPurpose] = await pool.query(
            `SELECT COALESCE(purpose,'Unspecified') AS purpose, COALESCE(SUM(amount),0) AS total
             FROM donations
             WHERE status='Completed'
             GROUP BY purpose
             ORDER BY total DESC
             LIMIT 10`
          );

          doc.fontSize(14).text("Top Purposes");
          doc.moveDown(0.5);
          doc.fontSize(11);
          byPurpose.forEach((p, i) => {
            doc.text(`${i + 1}. ${p.purpose} • PHP ${Number(p.total || 0).toLocaleString()}`);
          });
        }

        if (reportKey === "houses_summary") {
          const [rows] = await pool.query(
            `SELECT COALESCE(house,'Unassigned') AS house, COUNT(*) AS total
             FROM children
             GROUP BY house
             ORDER BY total DESC`
          );

          doc.fontSize(14).text("Children per House");
          doc.moveDown(0.5);
          doc.fontSize(11);
          rows.forEach((r, i) => {
            doc.text(`${i + 1}. ${r.house} • ${r.total} children`);
          });
        }

        if (reportKey === "annual_summary") {
          const [[cCount]] = await pool.query(`SELECT COUNT(*) AS c FROM children`);
          const [[mCount]] = await pool.query(`SELECT COUNT(*) AS c FROM milestones`);
          const [[dCount]] = await pool.query(`SELECT COUNT(*) AS c FROM donations WHERE status='Completed'`);

          doc.fontSize(14).text("Yearly Summary Snapshot");
          doc.moveDown(0.5);
          doc.fontSize(11);
          doc.text(`Children: ${Number(cCount.c || 0)}`);
          doc.text(`Milestones: ${Number(mCount.c || 0)}`);
          doc.text(`Completed Donations: ${Number(dCount.c || 0)}`);
        }

        doc.end();

        stream.on("finish", resolve);
        stream.on("error", reject);
      } catch (err) {
        reject(err);
      }
    });

    const fileUrl = pdfPathToUrl(absFile);
    const stat = fs.statSync(absFile);
    const sizeKb = Math.round(stat.size / 1024);

    // Insert row into generated_reports
    const [ins] = await pool.query(
      `INSERT INTO generated_reports
        (report_key, title, description, category, subcategory, period_label, status, format, file_url, file_size_kb, pages, child_id,
         generated_by, generated_by_name, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Ready', 'PDF', ?, ?, NULL, ?, ?, ?, ?, NOW())`,
      [
        reportKey,
        title,
        description,
        category,
        subcategory,
        periodLabel,
        fileUrl,
        sizeKb,
        childId || null,
        req.user?.id || null,
        req.user?.name || null,
        JSON.stringify({ generatedFrom: "live_db" }),
      ]
    );

    const newId = ins.insertId;

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Reports",
        resource: "Report",
        resourceId: newId,
        details: `Generated PDF report: ${title}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (GENERATE report):", e);
    }

    // Return new report (same shape your frontend expects)
    res.json({
      success: true,
      report: {
        id: newId,
        reportKey,
        title,
        description,
        category,
        subcategory,
        period: periodLabel,
        status: "Ready",
        format: "PDF",
        fileUrl,
        fileSize: `${(sizeKb / 1024).toFixed(1)} MB`,
        pages: null,
        childId: childId || null,
        childName: null,
        generatedAt: new Date().toISOString(),
        meta: { generatedFrom: "live_db" },
      },
    });
  } catch (e) {
    console.error("POST /reports/generate:", e);
    res.status(500).json({ success: false, message: "Failed to generate PDF. Check server logs." });
  }
});

/**
 * POST /api/reports/:id/view
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
