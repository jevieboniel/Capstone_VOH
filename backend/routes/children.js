// backend/routes/children.js
const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

    /* -------------------- GET all children -------------------- */
    router.get("/", async (_req, res) => {
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
    router.post("/", upload.single("photo"), async (req, res) => {
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

        // ✅ Return created child (consistent with frontend expectations)
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

    /* -------------------- PUT edit child (FIXED: DON'T CLEAR PHOTO) -------------------- */
    router.put("/:id", upload.single("photo"), async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        // ✅ Get current photo_url so we do not delete it when no new file is uploaded
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

        // ✅ Return updated child
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
    router.put("/:id/reintegration", async (req, res) => {
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

        // ✅ Return updated child
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

module.exports = router;
