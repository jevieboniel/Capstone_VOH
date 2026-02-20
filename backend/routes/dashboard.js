// backend/routes/dashboard.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// helpers
const toNumber = (v) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const money = (v) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// ✅ Your donations.status in DB is "Completed" (not Paid/Success)
// We'll include everything except Failed/failed
const DONATION_OK_WHERE = `status NOT IN ('Failed','failed')`;

// map audit_trail.module -> dashboard activity "type" used by getActivityIcon()
const mapActivityType = (moduleName = "") => {
  const m = String(moduleName || "").toLowerCase();

  if (m.includes("children")) return "admission";
  if (m.includes("health")) return "health";
  if (m.includes("donation")) return "donation";
  if (m.includes("development") || m.includes("milestone")) return "milestone";
  if (m.includes("report")) return "report";

  return "activity";
};

router.get("/overview", async (_req, res) => {
  try {
    // total active children
    const [childrenRows] = await db.query(
      `SELECT COUNT(*) AS totalChildren
       FROM children
       WHERE status = 'Active'`
    );

    // new admissions last 30 days
    const [newRows] = await db.query(
      `SELECT COUNT(*) AS newAdmissions
       FROM children
       WHERE admission_date IS NOT NULL
         AND admission_date >= (CURDATE() - INTERVAL 30 DAY)`
    );

    // health checks due = next_appointment within next 30 days
    const [healthRows] = await db.query(
      `SELECT COUNT(DISTINCT child_id) AS healthChecksDue
       FROM health_records
       WHERE next_appointment IS NOT NULL
         AND next_appointment <= (CURDATE() + INTERVAL 30 DAY)`
    );

    // total donations (exclude Failed)
    const [donationTotalRows] = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS totalDonations
       FROM donations
       WHERE ${DONATION_OK_WHERE}`
    );

    // monthly donations (exclude Failed)
    const [donationMonthRows] = await db.query(
      `SELECT COALESCE(SUM(amount),0) AS monthlyDonations
       FROM donations
       WHERE ${DONATION_OK_WHERE}
         AND YEAR(created_at) = YEAR(CURDATE())
         AND MONTH(created_at) = MONTH(CURDATE())`
    );

    // milestones totals + completed
    const [milestoneRows] = await db.query(
      `SELECT
         COUNT(*) AS developmentMilestones,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedMilestones
       FROM milestones`
    );

    // ✅ alerts (your alerts have sent_at + scheduled_at + created_at)
    const [alertsRows] = await db.query(
      `SELECT id, title, message, type, priority, status, scheduled_at, sent_at, created_at
       FROM alerts
       WHERE status IN ('scheduled', 'sent', 'draft')
       ORDER BY COALESCE(scheduled_at, sent_at, created_at) DESC
       LIMIT 10`
    );

    // ✅ recent activities from audit_trail (REAL columns)
    let recentActivities = [];
    try {
      const [auditRows] = await db.query(
        `SELECT id, action, module, user_name, created_at
         FROM audit_trail
         ORDER BY created_at DESC
         LIMIT 8`
      );

      recentActivities = auditRows.map((r) => ({
        id: r.id,
        action: r.action,
        user: r.user_name || "Unknown",
        type: mapActivityType(r.module), // 👈 so frontend icons work
        time: r.created_at,
      }));
    } catch (_e) {
      recentActivities = [];
    }

    // ✅ donation goal:
    // Your system_settings table DOES NOT have key/value rows.
    // So we use an ENV or default value.
    const donationGoal = toNumber(process.env.MONTHLY_DONATION_GOAL) || 20000;

    res.json({
      success: true,
      stats: {
        totalChildren: toNumber(childrenRows[0]?.totalChildren),
        newAdmissions: toNumber(newRows[0]?.newAdmissions),
        healthChecksDue: toNumber(healthRows[0]?.healthChecksDue),
        totalDonations: money(donationTotalRows[0]?.totalDonations),
        monthlyDonations: money(donationMonthRows[0]?.monthlyDonations),
        donationGoal: toNumber(donationGoal),
        developmentMilestones: toNumber(milestoneRows[0]?.developmentMilestones),
        completedMilestones: toNumber(milestoneRows[0]?.completedMilestones),
      },

      alerts: (alertsRows || []).map((a) => ({
        id: a.id,
        type: a.type || "general",
        priority: a.priority || "medium",
        // frontend uses alert.message
        message: a.message || a.title || "Alert",
        status: a.status,
        // ✅ date fallback order that matches your schema
        date: a.scheduled_at || a.sent_at || a.created_at,
        // you can fill this later if you want to join alert_recipients
        children: [],
      })),

      recentActivities,
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ success: false, error: "Dashboard overview error" });
  }
});

router.get("/demographics", async (_req, res) => {
  try {
    const [ageRows] = await db.query(`
      SELECT
        CASE
          WHEN age BETWEEN 0 AND 3 THEN '0-3 years'
          WHEN age BETWEEN 4 AND 6 THEN '4-6 years'
          WHEN age BETWEEN 7 AND 9 THEN '7-9 years'
          WHEN age BETWEEN 10 AND 12 THEN '10-12 years'
          WHEN age BETWEEN 13 AND 15 THEN '13-15 years'
          WHEN age BETWEEN 16 AND 18 THEN '16-18 years'
          ELSE '19+ years'
        END AS ageGroup,
        COUNT(*) AS count
      FROM children
      GROUP BY ageGroup
      ORDER BY FIELD(
        ageGroup,
        '0-3 years','4-6 years','7-9 years','10-12 years','13-15 years','16-18 years','19+ years'
      )
    `);

    // ✅ This is just "education level summary" (not subject performance)
    const [educationRows] = await db.query(`
      SELECT education_level AS grade, COUNT(*) AS count
      FROM children
      WHERE education_level IS NOT NULL AND education_level <> ''
      GROUP BY education_level
      ORDER BY education_level
    `);

    const [genderRows] = await db.query(`
      SELECT gender AS name, COUNT(*) AS value
      FROM children
      WHERE gender IS NOT NULL AND gender <> ''
      GROUP BY gender
      ORDER BY gender
    `);

    res.json({
      success: true,
      ageDistribution: ageRows,
      gradeDistribution: educationRows, // kept for compatibility
      genderDistribution: genderRows,
    });
  } catch (err) {
    console.error("Dashboard demographics error:", err);
    res.status(500).json({ success: false, error: "Dashboard demographics error" });
  }
});

router.get("/health", async (_req, res) => {
  try {
    const [statusRows] = await db.query(`
      SELECT health_status AS status, COUNT(*) AS count
      FROM children
      WHERE health_status IS NOT NULL AND health_status <> ''
      GROUP BY health_status
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      healthStatusDistribution: statusRows,
      vaccinationCoverage: [],
    });
  } catch (err) {
    console.error("Dashboard health error:", err);
    res.status(500).json({ success: false, error: "Dashboard health error" });
  }
});

router.get("/donations", async (_req, res) => {
  try {
    const [trendRows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%b') AS month,
        COALESCE(SUM(amount),0) AS amount,
        COUNT(DISTINCT donor_email) AS donors
      FROM donations
      WHERE ${DONATION_OK_WHERE}
        AND created_at >= (CURDATE() - INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), month
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);

    const [typeRows] = await db.query(`
      SELECT type, COUNT(*) AS value
      FROM donations
      WHERE ${DONATION_OK_WHERE}
      GROUP BY type
      ORDER BY value DESC
    `);

    res.json({
      success: true,
      donationTrends: trendRows,
      donorTypeDistribution: typeRows.map((r) => ({
        type: r.type || "Unknown",
        value: toNumber(r.value),
      })),
    });
  } catch (err) {
    console.error("Dashboard donations error:", err);
    res.status(500).json({ success: false, error: "Dashboard donations error" });
  }
});

router.get("/development", async (_req, res) => {
  try {
    const [progressRows] = await db.query(`
      SELECT category, ROUND(AVG(progress)) AS progress
      FROM milestones
      GROUP BY category
      ORDER BY category
    `);

    const [statusRows] = await db.query(`
      SELECT status AS name, COUNT(*) AS count
      FROM milestones
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      developmentProgress: progressRows,
      milestoneStatus: statusRows,
    });
  } catch (err) {
    console.error("Dashboard development error:", err);
    res.status(500).json({ success: false, error: "Dashboard development error" });
  }
});

router.get("/education", async (_req, res) => {
  try {
    let educationLevelSummary = [];
    let avgByLevel = [];
    let gradePerformance = [];

    const bucketCaseSQL = `
      CASE
        WHEN finalAvg IS NULL THEN 'No Grade'
        WHEN finalAvg < 75 THEN 'Below 75'
        WHEN finalAvg BETWEEN 75 AND 79.99 THEN '75-79'
        WHEN finalAvg BETWEEN 80 AND 84.99 THEN '80-84'
        WHEN finalAvg BETWEEN 85 AND 89.99 THEN '85-89'
        WHEN finalAvg BETWEEN 90 AND 94.99 THEN '90-94'
        WHEN finalAvg BETWEEN 95 AND 100 THEN '95-100'
        ELSE 'Over 100'
      END
    `;

    // ----------------------------
    // Try NEW schema first
    // ----------------------------
    try {
      // 1) Education level summary (latest per child)
      const [lvlRows] = await db.query(`
        SELECT t.education_level AS level, COUNT(*) AS count
        FROM (
          SELECT el.*
          FROM education_levels el
          INNER JOIN (
            SELECT child_id, MAX(id) AS max_id
            FROM education_levels
            GROUP BY child_id
          ) last ON last.child_id = el.child_id AND last.max_id = el.id
        ) t
        WHERE t.education_level IS NOT NULL AND t.education_level <> ''
        GROUP BY t.education_level
        ORDER BY t.education_level
      `);

      educationLevelSummary = lvlRows.map((r) => ({
        level: r.level,
        count: toNumber(r.count),
      }));

      // 2) Average final average per level (latest per child)
      const [avgRows] = await db.query(`
        SELECT t.education_level AS level, ROUND(AVG(t.final_average), 2) AS avg
        FROM (
          SELECT el.*
          FROM education_levels el
          INNER JOIN (
            SELECT child_id, MAX(id) AS max_id
            FROM education_levels
            GROUP BY child_id
          ) last ON last.child_id = el.child_id AND last.max_id = el.id
        ) t
        WHERE t.education_level IS NOT NULL AND t.education_level <> ''
          AND t.final_average IS NOT NULL
        GROUP BY t.education_level
        ORDER BY t.education_level
      `);

      avgByLevel = avgRows.map((r) => ({
        level: r.level,
        avg: toNumber(r.avg),
      }));

      // 3) Grade performance buckets (latest per child)
      const [bucketRows] = await db.query(`
        SELECT ${bucketCaseSQL} AS bucket, COUNT(*) AS count
        FROM (
          SELECT
            el.child_id,
            el.final_average AS finalAvg
          FROM education_levels el
          INNER JOIN (
            SELECT child_id, MAX(id) AS max_id
            FROM education_levels
            GROUP BY child_id
          ) last ON last.child_id = el.child_id AND last.max_id = el.id
        ) x
        GROUP BY bucket
        ORDER BY FIELD(bucket,'95-100','90-94','85-89','80-84','75-79','Below 75','No Grade','Over 100')
      `);

      gradePerformance = bucketRows.map((r) => ({
        bucket: r.bucket,
        count: toNumber(r.count),
      }));
    } catch (_e) {
      // ----------------------------
      // Fallback: children table only
      // ----------------------------
      const [lvlRowsFallback] = await db.query(`
        SELECT education_level AS level, COUNT(*) AS count
        FROM children
        WHERE education_level IS NOT NULL AND education_level <> ''
        GROUP BY education_level
        ORDER BY education_level
      `);

      educationLevelSummary = lvlRowsFallback.map((r) => ({
        level: r.level,
        count: toNumber(r.count),
      }));

      // Change COALESCE(...) to match your real column names if needed
      const [avgRowsFallback] = await db.query(`
        SELECT education_level AS level, ROUND(AVG(COALESCE(average_grade, final_average)), 2) AS avg
        FROM children
        WHERE education_level IS NOT NULL AND education_level <> ''
          AND COALESCE(average_grade, final_average) IS NOT NULL
        GROUP BY education_level
        ORDER BY education_level
      `);

      avgByLevel = avgRowsFallback.map((r) => ({
        level: r.level,
        avg: toNumber(r.avg),
      }));

      const [bucketRowsFallback] = await db.query(`
        SELECT
          CASE
            WHEN g IS NULL THEN 'No Grade'
            WHEN g < 75 THEN 'Below 75'
            WHEN g BETWEEN 75 AND 79.99 THEN '75-79'
            WHEN g BETWEEN 80 AND 84.99 THEN '80-84'
            WHEN g BETWEEN 85 AND 89.99 THEN '85-89'
            WHEN g BETWEEN 90 AND 94.99 THEN '90-94'
            WHEN g BETWEEN 95 AND 100 THEN '95-100'
            ELSE 'Over 100'
          END AS bucket,
          COUNT(*) AS count
        FROM (
          SELECT COALESCE(average_grade, final_average) AS g
          FROM children
        ) x
        GROUP BY bucket
        ORDER BY FIELD(bucket,'95-100','90-94','85-89','80-84','75-79','Below 75','No Grade','Over 100')
      `);

      gradePerformance = bucketRowsFallback.map((r) => ({
        bucket: r.bucket,
        count: toNumber(r.count),
      }));
    }

    res.json({
      success: true,
      // Chart 1: counts per educationLevel (summary)
      educationLevelSummary,
      // Optional: average finalAverage by level
      avgByLevel,
      // Chart 2: performance distribution using finalAverage
      gradePerformance,
    });
  } catch (err) {
    console.error("Dashboard education error:", err);
    res.status(500).json({ success: false, error: "Dashboard education error" });
  }
});

module.exports = router;