    // backend/routes/alerts.js
    const express = require("express");
    const router = express.Router();
    const db = require("../db");
    const nodemailer = require("nodemailer");

    // ✅ Use the SAME auth style as your users routes if possible:
    const { verifyToken, requireAdmin } = require("../middleware/auth");

    // ✅ Roles must match your Users.js roles exactly
    const VALID_ROLES = new Set(["Admin", "Staff", "Social Worker", "House Parent"]);
    const VALID_TYPES = new Set([
    "health",
    "education",
    "administrative",
    "urgent",
    "general",
    "maintenance",
    ]);
    const VALID_PRIORITY = new Set(["high", "medium", "low"]);

    // ✅ Gmail SMTP (Nodemailer). Best/easiest for your case.
    // Use App Password if 2FA is enabled.
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    function escapeHtml(s = "") {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function toMysqlDatetime(dateObj) {
    const pad = (n) => String(n).padStart(2, "0");
    const d = dateObj;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    // ===================================================
    // POST /api/alerts   (Admin/Staff create + send now OR schedule)
    // Frontend sends: recipient_roles, scheduled_at
    // But we also accept old keys: recipientRoles, scheduleAt
    // ===================================================
    router.post("/", verifyToken, async (req, res) => {
    try {
        const role = String(req.user?.role || "");
        const canSend = role === "Admin" || role === "Staff";
        if (!canSend) return res.status(403).json({ message: "Forbidden" });

        const body = req.body || {};

        const title = (body.title || "").trim();
        const message = (body.message || "").trim();

        // ✅ accept both new and old keys
        const type = body.type || "general";
        const priority = body.priority || "medium";
        const recipientRoles = body.recipient_roles ?? body.recipientRoles ?? [];
        const scheduledAtRaw = body.scheduled_at ?? body.scheduleAt ?? null;

        if (!title || !message) {
        return res
            .status(400)
            .json({ message: "Title and message are required." });
        }

        const safeType = VALID_TYPES.has(type) ? type : "general";
        const safePriority = VALID_PRIORITY.has(priority) ? priority : "medium";

        const roles = (Array.isArray(recipientRoles) ? recipientRoles : [])
        .map((r) => String(r).trim())
        .filter((r) => VALID_ROLES.has(r));

        if (!roles.length) {
        return res
            .status(400)
            .json({ message: "Select at least one recipient role." });
        }

        const isScheduled = Boolean(scheduledAtRaw);
        const scheduledAt = isScheduled ? new Date(scheduledAtRaw) : null;
        if (isScheduled && Number.isNaN(scheduledAt.getTime())) {
        return res.status(400).json({ message: "Invalid schedule date/time." });
        }

        const status = isScheduled ? "scheduled" : "sent";

        // 1) Insert alert row
        const [insertAlert] = await db.execute(
        `
        INSERT INTO alerts
            (title, message, type, priority, status, recipient_roles, scheduled_at, sent_at, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
            title,
            message,
            safeType,
            safePriority,
            status,
            JSON.stringify(roles),
            scheduledAt ? toMysqlDatetime(scheduledAt) : null,
            isScheduled ? null : toMysqlDatetime(new Date()),
            req.user?.id || null,
        ]
        );

        const alertId = insertAlert.insertId;

        // 2) Expand recipients from users table
        // Only Active users with email
        const placeholders = roles.map(() => "?").join(",");
        const [users] = await db.execute(
        `
        SELECT id, email
        FROM users
        WHERE role IN (${placeholders})
            AND status='Active'
            AND email IS NOT NULL
            AND email <> ''
        `,
        roles
        );

        if (!users.length) {
        await db.execute(`UPDATE alerts SET status='failed' WHERE id=?`, [alertId]);
        return res.json({
            message:
            "Alert created, but no active users with email were found for selected roles.",
            alertId,
            totalRecipients: 0,
            delivered: 0,
            failed: 0,
            status: "failed",
        });
        }

        // 3) Insert alert_recipients rows
        // default delivery_status: pending
        const values = users.map((u) => [alertId, u.id, u.email, "pending"]);
        await db.query(
        `INSERT INTO alert_recipients (alert_id, user_id, email, delivery_status) VALUES ?`,
        [values]
        );

        // 4) If not scheduled, send now
        if (!isScheduled) {
        const out = await sendAlertNow(alertId);
        return res.json({
            message: "Alert sent successfully.",
            alertId,
            ...out,
        });
        }

        // scheduled
        return res.json({
        message: "Alert scheduled successfully.",
        alertId,
        totalRecipients: users.length,
        delivered: 0,
        failed: 0,
        status: "scheduled",
        scheduled_at: toMysqlDatetime(scheduledAt),
        });
    } catch (err) {
        console.error("POST /alerts error:", err);
        return res.status(500).json({ message: "Failed to create/send alert." });
    }
    });

    // ===================================================
    // GET /api/alerts  (list with stats)
    // Frontend supports both: array OR {alerts:[]}
    // ===================================================
    router.get("/", verifyToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
        `
        SELECT
            a.*,
            COUNT(r.id) AS total_recipients,
            SUM(r.delivery_status='sent') AS delivered,
            SUM(r.delivery_status='failed') AS failed
        FROM alerts a
        LEFT JOIN alert_recipients r ON r.alert_id = a.id
        GROUP BY a.id
        ORDER BY COALESCE(a.sent_at, a.scheduled_at, a.created_at) DESC
        `
        );

        res.json({ alerts: rows });
    } catch (err) {
        console.error("GET /alerts error:", err);
        res.status(500).json({ message: "Failed to load alerts." });
    }
    });

    // ===================================================
    // GET /api/alerts/:id  (details + recipientsList)
    // Frontend expects: alert.recipientsList
    // ===================================================
    router.get("/:id", verifyToken, async (req, res) => {
    try {
        const alertId = req.params.id;

        const [[alert]] = await db.execute(`SELECT * FROM alerts WHERE id=?`, [alertId]);
        if (!alert) return res.status(404).json({ message: "Alert not found." });

        const [recipientsList] = await db.execute(
        `
        SELECT
            id,
            user_id,
            email,
            delivery_status,
            error_message,
            sent_at
        FROM alert_recipients
        WHERE alert_id=?
        ORDER BY id DESC
        `,
        [alertId]
        );

        // ✅ attach recipientsList so your modal works
        res.json({ alert: { ...alert, recipientsList } });
    } catch (err) {
        console.error("GET /alerts/:id error:", err);
        res.status(500).json({ message: "Failed to load alert details." });
    }
    });

    // ===================================================
    // POST /api/alerts/:id/resend-failed (Admin/Staff)
    // ===================================================
    router.post("/:id/resend-failed", verifyToken, async (req, res) => {
    try {
        const role = String(req.user?.role || "");
        const canResend = role === "Admin" || role === "Staff";
        if (!canResend) return res.status(403).json({ message: "Forbidden" });

        const alertId = req.params.id;

        const [[alert]] = await db.execute(`SELECT * FROM alerts WHERE id=?`, [alertId]);
        if (!alert) return res.status(404).json({ message: "Alert not found." });

        const [failed] = await db.execute(
        `
        SELECT id, email
        FROM alert_recipients
        WHERE alert_id=? AND delivery_status='failed'
        `,
        [alertId]
        );

        if (!failed.length) {
        return res.json({ message: "No failed recipients to resend." });
        }

        const subject = `[${String(alert.priority).toUpperCase()}] ${alert.title}`;
        const text = alert.message;

        let sentCount = 0;
        let failCount = 0;

        for (const r of failed) {
        try {
            await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.EMAIL_USER,
            to: r.email,
            subject,
            text,
            html: `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`,
            });

            sentCount++;
            await db.execute(
            `
            UPDATE alert_recipients
            SET delivery_status='sent', sent_at=NOW(), error_message=NULL
            WHERE id=?
            `,
            [r.id]
            );
        } catch (e) {
            failCount++;
            await db.execute(
            `UPDATE alert_recipients SET error_message=? WHERE id=?`,
            [String(e?.message || "Send failed"), r.id]
            );
        }
        }

        res.json({ message: "Resend finished.", sentCount, failCount });
    } catch (err) {
        console.error("POST /alerts/:id/resend-failed error:", err);
        res.status(500).json({ message: "Failed to resend failed emails." });
    }
    });

    // ===================================================
    // Internal: send now helper (used on create)
    // ===================================================
    async function sendAlertNow(alertId) {
    const [[alert]] = await db.execute(`SELECT * FROM alerts WHERE id=?`, [alertId]);
    if (!alert) throw new Error("Alert not found.");

    const [recips] = await db.execute(
        `
        SELECT id, email
        FROM alert_recipients
        WHERE alert_id=? AND delivery_status='pending'
        `,
        [alertId]
    );

    const subject = `[${String(alert.priority).toUpperCase()}] ${alert.title}`;
    const text = alert.message;

    let sentCount = 0;
    let failCount = 0;

    for (const r of recips) {
        try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.EMAIL_USER,
            to: r.email,
            subject,
            text,
            html: `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`,
        });

        sentCount++;
        await db.execute(
            `
            UPDATE alert_recipients
            SET delivery_status='sent', sent_at=NOW(), error_message=NULL
            WHERE id=?
            `,
            [r.id]
        );
        } catch (e) {
        failCount++;
        await db.execute(
            `
            UPDATE alert_recipients
            SET delivery_status='failed', error_message=?
            WHERE id=?
            `,
            [String(e?.message || "Send failed"), r.id]
        );
        }
    }

    await db.execute(
        `
        UPDATE alerts
        SET status=?, sent_at=IFNULL(sent_at, NOW())
        WHERE id=?
        `,
        [failCount > 0 && sentCount === 0 ? "failed" : "sent", alertId]
    );

    return { totalRecipients: recips.length, delivered: sentCount, failed: failCount };
    }

    module.exports = router;
