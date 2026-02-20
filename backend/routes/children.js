// backend/routes/children.js
const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { requirePermission } = require("../middleware/permissions");
const CHILD_PERM = "Child Management";

const router = express.Router();

/* -------------------- Multer upload setup -------------------- */
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `child_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

/* -------------------- helpers -------------------- */
const toISODate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const isReintegratedPair = (status, adoptionStatus) => {
  const s = String(status || "").toLowerCase();
  const a = String(adoptionStatus || "").toLowerCase();
  return s === "reintegrated" && a === "adopted";
};

const numOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/* -------------------- GET all children -------------------- */
router.get("/", verifyToken, requirePermission(CHILD_PERM), async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM children ORDER BY id DESC");

    const children = rows.map((r) => ({
      id: r.id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      age: r.age,
      gender: r.gender,
      admissionDate: r.admission_date ? r.admission_date.toISOString().slice(0, 10) : "",
      house: r.house,
      houseParent: r.house_parent,
      healthStatus: r.health_status,
      educationLevel: r.education_level,
      emergencyContact: r.emergency_contact,
      caseType: r.case_type,
      status: r.status,
      adoptionStatus: r.adoption_status,
      notes: r.notes,
      lastCheckup: r.last_checkup,
      photoUrl: r.photo_url ? `${BASE_URL}${r.photo_url}` : null,
      reintegration: r.reintegration ? JSON.parse(r.reintegration) : null,
      image: "https://i.pravatar.cc/100",
    }));

    return res.json({ success: true, children });
  } catch (err) {
    console.error("GET /children error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* -------------------- POST add child -------------------- */
router.post("/", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const body = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payload = {
      first_name: body.firstName,
      middle_name: body.middleName || null,
      last_name: body.lastName,
      age: Number(body.age),
      gender: body.gender,
      admission_date: body.admissionDate || null,
      house: body.house || null,
      house_parent: body.houseParent || null,
      health_status: body.healthStatus || null,
      education_level: body.educationLevel || null,
      emergency_contact: body.emergencyContact || null,
      case_type: body.caseType || null,
      status: body.status || "Active",
      adoption_status: body.adoptionStatus || "Not Available for Adoption",
      notes: body.notes || null,
      last_checkup: body.lastCheckup || null,
      photo_url: photoUrl,
    };

    if (!payload.first_name || !payload.last_name || !payload.age || !payload.gender) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO children
        (first_name, middle_name, last_name, age, gender, admission_date, house, house_parent,
        health_status, education_level, emergency_contact, case_type, status, adoption_status,
        notes, last_checkup, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.first_name,
        payload.middle_name,
        payload.last_name,
        payload.age,
        payload.gender,
        payload.admission_date,
        payload.house,
        payload.house_parent,
        payload.health_status,
        payload.education_level,
        payload.emergency_contact,
        payload.case_type,
        payload.status,
        payload.adoption_status,
        payload.notes,
        payload.last_checkup,
        payload.photo_url,
      ]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Children Management",
        resource: "Child",
        resourceId: result.insertId,
        details: `Created child profile: ${payload.first_name} ${payload.last_name}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (CREATE child):", e);
    }

    const [rows] = await pool.query("SELECT * FROM children WHERE id=?", [result.insertId]);
    const r = rows[0];

    const child = {
      id: r.id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      age: r.age,
      gender: r.gender,
      admissionDate: r.admission_date ? r.admission_date.toISOString().slice(0, 10) : "",
      house: r.house,
      houseParent: r.house_parent,
      healthStatus: r.health_status,
      educationLevel: r.education_level,
      emergencyContact: r.emergency_contact,
      caseType: r.case_type,
      status: r.status,
      adoptionStatus: r.adoption_status,
      notes: r.notes,
      lastCheckup: r.last_checkup,
      photoUrl: r.photo_url ? `${BASE_URL}${r.photo_url}` : null,
      reintegration: r.reintegration ? JSON.parse(r.reintegration) : null,
      image: "https://i.pravatar.cc/100",
    };

    return res.json({ success: true, child });
  } catch (err) {
    console.error("POST /children error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* -------------------- PUT edit child (DON'T CLEAR PHOTO) -------------------- */
router.put("/:id", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const [existingRows] = await pool.query("SELECT photo_url, reintegration FROM children WHERE id=?", [id]);
    if (!existingRows.length) {
      return res.status(404).json({ success: false, error: "Child not found" });
    }

    const existingPhotoUrl = existingRows[0].photo_url || null;
    const existingReintegration = existingRows[0].reintegration || null;

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : existingPhotoUrl;

    const nextStatus = body.status || "Active";
    const nextAdoptionStatus = body.adoptionStatus || "Not Available for Adoption";

    // If NOT (Reintegrated + Adopted) => reintegration must be cleared
    const keepReintegration = isReintegratedPair(nextStatus, nextAdoptionStatus);

    // If frontend sent reintegration but status/adoption doesn't match, ignore it
    const reintegrationValue = keepReintegration
      ? (body.reintegration ? JSON.stringify(body.reintegration) : existingReintegration)
      : null;

    await pool.query(
      `UPDATE children SET
          first_name=?,
          middle_name=?,
          last_name=?,
          age=?,
          gender=?,
          admission_date=?,
          house=?,
          house_parent=?,
          health_status=?,
          education_level=?,
          emergency_contact=?,
          case_type=?,
          status=?,
          adoption_status=?,
          notes=?,
          last_checkup=?,
          photo_url=?,
          reintegration=?
      WHERE id=?`,
      [
        body.firstName,
        body.middleName || null,
        body.lastName,
        Number(body.age),
        body.gender,
        body.admissionDate || null,
        body.house || null,
        body.houseParent || null,
        body.healthStatus || null,
        body.educationLevel || null,
        body.emergencyContact || null,
        body.caseType || null,
        nextStatus,
        nextAdoptionStatus,
        body.notes || null,
        body.lastCheckup || null,
        photoUrl,
        reintegrationValue,
        id,
      ]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Child",
        resourceId: id,
        details: `Updated child profile: ${body.firstName} ${body.lastName}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE child):", e);
    }

    const [rows] = await pool.query("SELECT * FROM children WHERE id=?", [id]);
    const r = rows[0];

    const child = {
      id: r.id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      age: r.age,
      gender: r.gender,
      admissionDate: r.admission_date ? r.admission_date.toISOString().slice(0, 10) : "",
      house: r.house,
      houseParent: r.house_parent,
      healthStatus: r.health_status,
      educationLevel: r.education_level,
      emergencyContact: r.emergency_contact,
      caseType: r.case_type,
      status: r.status,
      adoptionStatus: r.adoption_status,
      notes: r.notes,
      lastCheckup: r.last_checkup,
      photoUrl: r.photo_url ? `${BASE_URL}${r.photo_url}` : null,
      reintegration: r.reintegration ? JSON.parse(r.reintegration) : null,
      image: "https://i.pravatar.cc/100",
    };

    return res.json({ success: true, child });
  } catch (err) {
    console.error("PUT /children/:id error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* -------------------- PUT reintegration -------------------- */
router.put("/:id/reintegration", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reintegration = req.body;

    await pool.query(
      `UPDATE children SET
            reintegration=?,
            status='Reintegrated',
            adoption_status='Adopted'
        WHERE id=?`,
      [JSON.stringify(reintegration), id]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Reintegration",
        resourceId: id,
        details: "Updated reintegration and status to Reintegrated/Adopted",
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE reintegration):", e);
    }

    const [rows] = await pool.query("SELECT * FROM children WHERE id=?", [id]);
    if (!rows.length) return res.json({ success: true });

    const r = rows[0];
    const child = {
      id: r.id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      age: r.age,
      gender: r.gender,
      admissionDate: r.admission_date ? r.admission_date.toISOString().slice(0, 10) : "",
      house: r.house,
      houseParent: r.house_parent,
      healthStatus: r.health_status,
      educationLevel: r.education_level,
      emergencyContact: r.emergency_contact,
      caseType: r.case_type,
      status: r.status,
      adoptionStatus: r.adoption_status,
      notes: r.notes,
      lastCheckup: r.last_checkup,
      photoUrl: r.photo_url ? `${BASE_URL}${r.photo_url}` : null,
      reintegration: r.reintegration ? JSON.parse(r.reintegration) : null,
      image: "https://i.pravatar.cc/100",
    };

    return res.json({ success: true, child });
  } catch (err) {
    console.error("PUT /children/:id/reintegration error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =========================================================
    HEALTH RECORDS ROUTES
    Base: /api/children
    ========================================================= */

/** GET health records for a child */
router.get("/:id/health-records", verifyToken, requirePermission(CHILD_PERM), async (req, res) => {
  try {
    const { id } = req.params;

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [rows] = await pool.query(
      `SELECT id, child_id, record_type, provider, record_date, notes, next_appointment
        FROM health_records
        WHERE child_id=?
        ORDER BY record_date DESC, id DESC`,
      [id]
    );

    const records = rows.map((r) => ({
      id: r.id,
      childId: r.child_id,
      recordType: r.record_type,
      provider: r.provider,
      recordDate: toISODate(r.record_date),
      notes: r.notes,
      nextAppointment: toISODate(r.next_appointment),
    }));

    return res.json({ success: true, records });
  } catch (err) {
    console.error("GET /children/:id/health-records error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** POST create a health record for a child */
router.post("/:id/health-records", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const recordType = body.recordType || body.record_type;
    const provider = body.provider;
    const recordDate = body.recordDate || body.record_date;
    const notes = body.notes;
    const nextAppointment = body.nextAppointment || body.next_appointment || null;

    if (!recordType || !provider || !recordDate || !notes) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [result] = await pool.query(
      `INSERT INTO health_records (child_id, record_type, provider, record_date, notes, next_appointment)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [id, recordType, provider, recordDate, notes, nextAppointment]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Children Management",
        resource: "Health Record",
        resourceId: result.insertId,
        details: `Created health record for child #${id}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (CREATE health record):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, record_type, provider, record_date, notes, next_appointment
        FROM health_records WHERE id=?`,
      [result.insertId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      recordType: r.record_type,
      provider: r.provider,
      recordDate: toISODate(r.record_date),
      notes: r.notes,
      nextAppointment: toISODate(r.next_appointment),
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("POST /children/:id/health-records error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** PUT update a health record */
router.put("/health-records/:recordId", verifyToken, async (req, res) => {
  try {
    const { recordId } = req.params;
    const body = req.body;

    const recordType = body.recordType || body.record_type;
    const provider = body.provider;
    const recordDate = body.recordDate || body.record_date;
    const notes = body.notes;
    const nextAppointment = body.nextAppointment || body.next_appointment || null;

    if (!recordType || !provider || !recordDate || !notes) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [existing] = await pool.query("SELECT id FROM health_records WHERE id=?", [recordId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query(
      `UPDATE health_records SET record_type=?, provider=?, record_date=?, notes=?, next_appointment=?
        WHERE id=?`,
      [recordType, provider, recordDate, notes, nextAppointment, recordId]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Health Record",
        resourceId: recordId,
        details: `Updated health record #${recordId}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE health record):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, record_type, provider, record_date, notes, next_appointment
        FROM health_records WHERE id=?`,
      [recordId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      recordType: r.record_type,
      provider: r.provider,
      recordDate: toISODate(r.record_date),
      notes: r.notes,
      nextAppointment: toISODate(r.next_appointment),
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("PUT /children/health-records/:recordId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** DELETE a health record */
router.delete("/health-records/:recordId", verifyToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const [existing] = await pool.query("SELECT id FROM health_records WHERE id=?", [recordId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query("DELETE FROM health_records WHERE id=?", [recordId]);

    try {
      await logAudit(req, {
        action: "DELETE",
        module: "Children Management",
        resource: "Health Record",
        resourceId: recordId,
        details: `Deleted health record #${recordId}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (DELETE health record):", e);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /children/health-records/:recordId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =========================================================
    EDUCATION ROUTES (PER LEVEL)
    Base: /api/children
    Requires table: education_levels
    ========================================================= */

/** GET education levels for a child */
router.get("/:id/education", verifyToken, requirePermission(CHILD_PERM), async (req, res) => {
  try {
    const { id } = req.params;

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [rows] = await pool.query(
      `SELECT id, child_id, education_level, school, final_average, honor, created_at, updated_at
       FROM education_levels
       WHERE child_id=?
       ORDER BY created_at DESC, id DESC`,
      [id]
    );

    const levels = rows.map((r) => ({
      id: r.id,
      childId: r.child_id,
      educationLevel: r.education_level,
      school: r.school || "",
      finalAverage: r.final_average === null ? "" : Number(r.final_average),
      honor: r.honor || "None",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return res.json({ success: true, levels });
  } catch (err) {
    console.error("GET /children/:id/education error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** POST add education level record */
router.post("/:id/education-levels", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const educationLevel = String(body.educationLevel || body.education_level || "").trim();
    const school = String(body.school || "").trim() || null;
    const finalAverage = numOrNull(body.finalAverage ?? body.final_average);
    const honor = String(body.honor || "None").trim() || "None";

    if (!educationLevel) {
      return res.status(400).json({ success: false, error: "educationLevel is required" });
    }
    if (finalAverage !== null && Number.isNaN(finalAverage)) {
      return res.status(400).json({ success: false, error: "finalAverage must be a number" });
    }

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [result] = await pool.query(
      `INSERT INTO education_levels (child_id, education_level, school, final_average, honor)
       VALUES (?, ?, ?, ?, ?)`,
      [id, educationLevel, school, finalAverage, honor]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Children Management",
        resource: "Education Level",
        resourceId: result.insertId,
        details: `Created education level record for child #${id} (${educationLevel})`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (CREATE education level):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, education_level, school, final_average, honor, created_at, updated_at
       FROM education_levels WHERE id=?`,
      [result.insertId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      educationLevel: r.education_level,
      school: r.school || "",
      finalAverage: r.final_average === null ? "" : Number(r.final_average),
      honor: r.honor || "None",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("POST /children/:id/education-levels error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** PUT update education level record */
router.put("/education-levels/:levelId", verifyToken, async (req, res) => {
  try {
    const { levelId } = req.params;
    const body = req.body;

    const educationLevel = String(body.educationLevel || body.education_level || "").trim();
    const school = String(body.school || "").trim() || null;
    const finalAverage = numOrNull(body.finalAverage ?? body.final_average);
    const honor = String(body.honor || "None").trim() || "None";

    if (!educationLevel) {
      return res.status(400).json({ success: false, error: "educationLevel is required" });
    }
    if (finalAverage !== null && Number.isNaN(finalAverage)) {
      return res.status(400).json({ success: false, error: "finalAverage must be a number" });
    }

    const [existing] = await pool.query("SELECT id FROM education_levels WHERE id=?", [levelId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query(
      `UPDATE education_levels
       SET education_level=?, school=?, final_average=?, honor=?
       WHERE id=?`,
      [educationLevel, school, finalAverage, honor, levelId]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Education Level",
        resourceId: levelId,
        details: `Updated education level record #${levelId} (${educationLevel})`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE education level):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, education_level, school, final_average, honor, created_at, updated_at
       FROM education_levels WHERE id=?`,
      [levelId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      educationLevel: r.education_level,
      school: r.school || "",
      finalAverage: r.final_average === null ? "" : Number(r.final_average),
      honor: r.honor || "None",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("PUT /children/education-levels/:levelId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** DELETE education level record */
router.delete("/education-levels/:levelId", verifyToken, async (req, res) => {
  try {
    const { levelId } = req.params;

    const [existing] = await pool.query("SELECT id FROM education_levels WHERE id=?", [levelId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query("DELETE FROM education_levels WHERE id=?", [levelId]);

    try {
      await logAudit(req, {
        action: "DELETE",
        module: "Children Management",
        resource: "Education Level",
        resourceId: levelId,
        details: `Deleted education level record #${levelId}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (DELETE education level):", e);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /children/education-levels/:levelId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;