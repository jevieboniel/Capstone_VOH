const express = require("express");
const pool = require("../db");

const router = express.Router();

/**
 * GET /api/milestones
 * returns milestones with objectives + child full name
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          m.*,
          c.first_name, c.middle_name, c.last_name
       FROM milestones m
       JOIN children c ON c.id = m.child_id
       ORDER BY m.id DESC`
    );

    if (!rows.length) return res.json({ success: true, milestones: [] });

    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => "?").join(",");
    const [objRows] = await pool.query(
      `SELECT milestone_id, objective 
       FROM milestone_objectives
       WHERE milestone_id IN (${placeholders})`,
      ids
    );

    const objMap = new Map();
    for (const o of objRows) {
      if (!objMap.has(o.milestone_id)) objMap.set(o.milestone_id, []);
      objMap.get(o.milestone_id).push(o.objective);
    }

    const milestones = rows.map((r) => {
      const childName = `${r.first_name || ""} ${r.middle_name ? r.middle_name + " " : ""}${r.last_name || ""}`.trim();

      return {
        id: r.id,
        childId: r.child_id,
        child: childName,
        category: r.category,
        milestone: r.title,
        description: r.description || "",
        targetDate: r.target_date ? r.target_date.toISOString().slice(0, 10) : "",
        notes: r.notes || "",
        objectives: objMap.get(r.id) || [],
        status: r.status,
        progress: r.progress,
        assignedBy: r.assigned_by || "System Admin",
        createdDate: r.created_date ? r.created_date.toISOString().slice(0, 10) : "",
        lastUpdated: r.last_updated ? r.last_updated.toISOString().slice(0, 10) : "",
      };
    });

    return res.json({ success: true, milestones });
  } catch (err) {
    console.error("GET /milestones error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/milestones
 * body: { childId, category, title, description, targetDate, notes, objectives }
 */
router.post("/", async (req, res) => {
  const {
    childId,
    category,
    title,
    description = "",
    targetDate = null,
    notes = "",
    objectives = [],
    assignedBy = "System Admin",
  } = req.body;

  if (!childId || !category || !title) {
    return res.status(400).json({ success: false, error: "childId, category, title are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const today = new Date().toISOString().slice(0, 10);

    const [ins] = await conn.query(
      `INSERT INTO milestones
        (child_id, category, title, description, target_date, notes, status, progress, assigned_by, created_date, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, 'Planned', 0, ?, ?, ?)`,
      [childId, category, title, description, targetDate || null, notes, assignedBy, today, today]
    );

    const milestoneId = ins.insertId;

    const cleanObjectives = Array.isArray(objectives)
      ? objectives.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim())
      : [];

    if (cleanObjectives.length) {
      const values = cleanObjectives.map((o) => [milestoneId, o]);
      await conn.query(
        `INSERT INTO milestone_objectives (milestone_id, objective) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res.json({ success: true, id: milestoneId });
  } catch (err) {
    await conn.rollback();
    console.error("POST /milestones error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  } finally {
    conn.release();
  }
});

/**
 * PUT /api/milestones/:id
 * body uses your UI format: { category, milestone, description, targetDate, notes, status, progress, objectives }
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    category,
    milestone, // title
    description = "",
    targetDate = null,
    notes = "",
    status = "Planned",
    progress = 0,
    objectives = [],
  } = req.body;

  if (!category || !milestone) {
    return res.status(400).json({ success: false, error: "category and milestone are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const today = new Date().toISOString().slice(0, 10);

    await conn.query(
      `UPDATE milestones
       SET category=?, title=?, description=?, target_date=?, notes=?, status=?, progress=?, last_updated=?
       WHERE id=?`,
      [category, milestone, description, targetDate || null, notes, status, Number(progress) || 0, today, id]
    );

    await conn.query(`DELETE FROM milestone_objectives WHERE milestone_id=?`, [id]);

    const cleanObjectives = Array.isArray(objectives)
      ? objectives.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim())
      : [];

    if (cleanObjectives.length) {
      const values = cleanObjectives.map((o) => [id, o]);
      await conn.query(
        `INSERT INTO milestone_objectives (milestone_id, objective) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("PUT /milestones/:id error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  } finally {
    conn.release();
  }
});

module.exports = router;
