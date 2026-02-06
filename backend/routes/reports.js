const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

/**
 * This endpoint returns "ready-made reports" metadata like your Reports.jsx mock generator.
 * It does not generate PDFs yet (we can add /:id/download later).
 *
 * GET /api/reports?search=&category=
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    const category = (req.query.category || "all").trim(); // Children, Development, Financial, Houses, System

    // Load children + basic fields we need for report titles/metadata
    const [children] = await pool.query(
      `SELECT id, first_name, middle_name, last_name, age, house, health_status, education_level
       FROM children
       ORDER BY id DESC`
    );

    // Load milestone stats per child
    const [milestoneAgg] = await pool.query(
      `
      SELECT
        child_id,
        COUNT(*) AS totalMilestones,
        SUM(status = 'Completed') AS completedMilestones,
        SUM(status = 'In Progress') AS inProgressMilestones
      FROM milestones
      GROUP BY child_id
      `
    );

    const statsMap = new Map();
    for (const m of milestoneAgg) {
      const total = Number(m.totalMilestones || 0);
      const completed = Number(m.completedMilestones || 0);
      const inProgress = Number(m.inProgressMilestones || 0);
      const overall = total === 0 ? 0 : Math.round((completed / total) * 100 + (inProgress * 25) / total);
      statsMap.set(Number(m.child_id), { total, completed, inProgress, overall });
    }

    const today = new Date();
    const period = today.toLocaleString("default", { month: "long", year: "numeric" });
    const todayStr = today.toISOString().split("T")[0];

    const fullName = (c) =>
      [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

    const reports = [];

    // Per-child reports
    for (const c of children) {
      const name = fullName(c);
      const s = statsMap.get(Number(c.id)) || { total: 0, completed: 0, inProgress: 0, overall: 0 };

      reports.push({
        id: `child-profile-${c.id}`,
        title: `${name} - Complete Profile Report`,
        description: "Comprehensive profile including personal info, health records, education, and development milestones.",
        category: "Children",
        subcategory: "Individual Profiles",
        type: "Child Profile",
        generatedDate: todayStr,
        period,
        status: "Ready",
        fileSize: "1.2 MB",
        pages: 8,
        format: "PDF",
        childName: name,
        metadata: { childId: c.id, age: c.age, house: c.house, totalMilestones: s.total },
      });

      reports.push({
        id: `child-health-${c.id}`,
        title: `${name} - Health Records Report`,
        description: "Medical history, vaccinations, check-ups, and overall health status.",
        category: "Children",
        subcategory: "Health Records",
        type: "Health Report",
        generatedDate: todayStr,
        period,
        status: "Ready",
        fileSize: "0.8 MB",
        pages: 4,
        format: "PDF",
        childName: name,
        metadata: { healthStatus: c.health_status },
      });

      reports.push({
        id: `child-education-${c.id}`,
        title: `${name} - Education Progress Report`,
        description: "Academic performance, grades, and teacher comments overview.",
        category: "Children",
        subcategory: "Education Records",
        type: "Education Report",
        generatedDate: todayStr,
        period,
        status: "Ready",
        fileSize: "0.6 MB",
        pages: 5,
        format: "PDF",
        childName: name,
        metadata: { currentGrade: c.education_level },
      });
    }

    // Summary reports
    reports.push({
      id: "children-overview",
      title: "All Children Overview Report",
      description: "Summary of all children including demographics, health status, and placement.",
      category: "Children",
      subcategory: "Summary Reports",
      type: "Overview",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "2.5 MB",
      pages: 12,
      format: "PDF",
      metadata: { totalChildren: children.length },
    });

    const needingCheckup = children.filter((c) => (c.health_status || "").toLowerCase() === "needs check-up").length;
    reports.push({
      id: "health-summary",
      title: "Health Status Summary Report",
      description: "Aggregated health data for all children including upcoming check-ups.",
      category: "Children",
      subcategory: "Summary Reports",
      type: "Health Summary",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "1.8 MB",
      pages: 8,
      format: "PDF",
      metadata: { needingCheckup },
    });

    reports.push({
      id: "development-overall",
      title: "Overall Development Progress Report",
      description: "Comprehensive analysis of development milestones across all children.",
      category: "Development",
      subcategory: "Summary Reports",
      type: "Development Overview",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "3.2 MB",
      pages: 18,
      format: "PDF",
    });

    reports.push({
      id: "milestones-at-risk",
      title: "At-Risk Milestones Report",
      description: "Milestones falling behind schedule that require immediate attention.",
      category: "Development",
      subcategory: "Priority Reports",
      type: "At-Risk Milestones",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "0.9 MB",
      pages: 4,
      format: "PDF",
    });

    reports.push({
      id: "milestones-completed",
      title: "Completed Milestones Report",
      description: "Summary of milestones successfully achieved this period.",
      category: "Development",
      subcategory: "Achievement Reports",
      type: "Completed Milestones",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "1.6 MB",
      pages: 7,
      format: "PDF",
    });

    reports.push({
      id: "donations-summary",
      title: "Donation Summary Report",
      description: "Overview of donations including trends, top donors, and fund allocation.",
      category: "Financial",
      subcategory: "Donation Reports",
      type: "Donation Summary",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "2.1 MB",
      pages: 11,
      format: "PDF",
    });

    reports.push({
      id: "financial-summary",
      title: "Financial Summary Report",
      description: "Income, expenses, and budget allocation overview for this period.",
      category: "Financial",
      subcategory: "Financial Reports",
      type: "Financial Summary",
      generatedDate: todayStr,
      period,
      status: "Ready",
      fileSize: "2.8 MB",
      pages: 15,
      format: "PDF",
    });

    // Houses - based on distinct house values in DB
    const houses = [...new Set(children.map((c) => c.house).filter(Boolean))];
    for (const h of houses) {
      const count = children.filter((c) => c.house === h).length;
      reports.push({
        id: `house-${String(h).toLowerCase().replace(/\s+/g, "-")}`,
        title: `${h} - House Report`,
        description: "Overview of children, activities, and needs for this house.",
        category: "Houses",
        subcategory: "House Reports",
        type: "House Overview",
        generatedDate: todayStr,
        period,
        status: "Ready",
        fileSize: "1.0 MB",
        pages: 5,
        format: "PDF",
        metadata: { totalChildren: count },
      });
    }

    reports.push({
      id: "annual-summary",
      title: "Annual Summary Report",
      description: "Year-end summary covering major areas of operations.",
      category: "System",
      subcategory: "Annual Reports",
      type: "Annual Summary",
      generatedDate: todayStr,
      period: String(today.getFullYear()),
      status: "Ready",
      fileSize: "5.2 MB",
      pages: 35,
      format: "PDF",
    });

    // Apply filters like your UI
    const q = search;
    const filtered = reports.filter((r) => {
      const catOk = category === "all" || r.category === category;
      if (!catOk) return false;
      if (!q) return true;
      const t = String(r.title || "").toLowerCase();
      const d = String(r.description || "").toLowerCase();
      const c = String(r.childName || "").toLowerCase();
      return t.includes(q) || d.includes(q) || c.includes(q);
    });

    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
