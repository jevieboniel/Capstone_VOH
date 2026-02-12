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

    const [existingRows] = await pool.query("SELECT photo_url FROM children WHERE id=?", [id]);
    if (!existingRows.length) {
      return res.status(404).json({ success: false, error: "Child not found" });
    }

    const existingPhotoUrl = existingRows[0].photo_url || null;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : existingPhotoUrl;

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
            photo_url=?
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
        body.status || "Active",
        body.adoptionStatus || "Not Available for Adoption",
        body.notes || null,
        body.lastCheckup || null,
        photoUrl,
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

    // ensure child exists (optional but nice)
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
    EDUCATION ROUTES
    Base: /api/children
    ========================================================= */

/** GET education summary + subject details */
router.get("/:id/education", verifyToken, requirePermission(CHILD_PERM), async (req, res) => {
  try {
    const { id } = req.params;

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [sumRows] = await pool.query(
      `SELECT school, average_grade, honor
        FROM education_summaries
        WHERE child_id=?`,
      [id]
    );

    const summaryRow = sumRows[0] || { school: "", average_grade: "", honor: "None" };

    const [subRows] = await pool.query(
      `SELECT id, child_id, subject, grade, teacher, term, comments
        FROM education_records
        WHERE child_id=?
        ORDER BY id DESC`,
      [id]
    );

    const summary = {
      school: summaryRow.school || "",
      averageGrade: summaryRow.average_grade ?? "",
      honor: summaryRow.honor || "None",
    };

    const subjects = subRows.map((r) => ({
      id: r.id,
      childId: r.child_id,
      subject: r.subject,
      grade: r.grade,
      teacher: r.teacher,
      term: r.term || "",
      comments: r.comments || "",
    }));

    return res.json({ success: true, summary, subjects });
  } catch (err) {
    console.error("GET /children/:id/education error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** PUT upsert education summary (edit summary card) */
router.put("/:id/education-summary", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const school = body.school || "";
    const averageGrade =
      body.averageGrade === "" || body.averageGrade === null || body.averageGrade === undefined
        ? null
        : Number(body.averageGrade);
    const honor = body.honor || "None";

    if (averageGrade !== null && Number.isNaN(averageGrade)) {
      return res.status(400).json({ success: false, error: "averageGrade must be a number" });
    }

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    await pool.query(
      `INSERT INTO education_summaries (child_id, school, average_grade, honor)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            school=VALUES(school),
            average_grade=VALUES(average_grade),
            honor=VALUES(honor)`,
      [id, school || null, averageGrade, honor]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Education Summary",
        resourceId: id,
        details: `Updated education summary for child #${id}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE education summary):", e);
    }

    const [rows] = await pool.query(
      `SELECT school, average_grade, honor
        FROM education_summaries WHERE child_id=?`,
      [id]
    );

    const r = rows[0] || { school: "", average_grade: "", honor: "None" };

    const summary = {
      school: r.school || "",
      averageGrade: r.average_grade ?? "",
      honor: r.honor || "None",
    };

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("PUT /children/:id/education-summary error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** POST add education subject record */
router.post("/:id/education-records", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const subject = body.subject;
    const grade = body.grade;
    const teacher = body.teacher;
    const term = body.term || null;
    const comments = body.comments || null;

    if (!subject || !grade || !teacher) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [childRows] = await pool.query("SELECT id FROM children WHERE id=?", [id]);
    if (!childRows.length) return res.status(404).json({ success: false, error: "Child not found" });

    const [result] = await pool.query(
      `INSERT INTO education_records (child_id, subject, grade, teacher, term, comments)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [id, subject, grade, teacher, term, comments]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Children Management",
        resource: "Education Record",
        resourceId: result.insertId,
        details: `Created education record for child #${id} (${subject})`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (CREATE education record):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, subject, grade, teacher, term, comments
        FROM education_records WHERE id=?`,
      [result.insertId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      subject: r.subject,
      grade: r.grade,
      teacher: r.teacher,
      term: r.term || "",
      comments: r.comments || "",
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("POST /children/:id/education-records error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** PUT update education subject record */
router.put("/education-records/:recordId", verifyToken, async (req, res) => {
  try {
    const { recordId } = req.params;
    const body = req.body;

    const subject = body.subject;
    const grade = body.grade;
    const teacher = body.teacher;
    const term = body.term || null;
    const comments = body.comments || null;

    if (!subject || !grade || !teacher) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [existing] = await pool.query("SELECT id FROM education_records WHERE id=?", [recordId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query(
      `UPDATE education_records
        SET subject=?, grade=?, teacher=?, term=?, comments=?
        WHERE id=?`,
      [subject, grade, teacher, term, comments, recordId]
    );

    try {
      await logAudit(req, {
        action: "UPDATE",
        module: "Children Management",
        resource: "Education Record",
        resourceId: recordId,
        details: `Updated education record #${recordId} (${subject})`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (UPDATE education record):", e);
    }

    const [rows] = await pool.query(
      `SELECT id, child_id, subject, grade, teacher, term, comments
        FROM education_records WHERE id=?`,
      [recordId]
    );

    const r = rows[0];
    const record = {
      id: r.id,
      childId: r.child_id,
      subject: r.subject,
      grade: r.grade,
      teacher: r.teacher,
      term: r.term || "",
      comments: r.comments || "",
    };

    return res.json({ success: true, record });
  } catch (err) {
    console.error("PUT /children/education-records/:recordId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

/** DELETE education subject record */
router.delete("/education-records/:recordId", verifyToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    const [existing] = await pool.query("SELECT id FROM education_records WHERE id=?", [recordId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Record not found" });

    await pool.query("DELETE FROM education_records WHERE id=?", [recordId]);

    try {
      await logAudit(req, {
        action: "DELETE",
        module: "Children Management",
        resource: "Education Record",
        resourceId: recordId,
        details: `Deleted education record #${recordId}`,
        severity: "info",
      });
    } catch (e) {
      console.error("Audit log failed (DELETE education record):", e);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /children/education-records/:recordId error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
