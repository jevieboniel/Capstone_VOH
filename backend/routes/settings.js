    const express = require("express");
    const router = express.Router();
    const db = require("../db");
    const { verifyToken, requireAdmin } = require("../middleware/auth");

    /**
     * GET /api/settings
     * - load general + notifications + darkMode
     */
    router.get("/", verifyToken, async (req, res) => {
    try {
        const [settingsRows] = await db.query("SELECT * FROM system_settings ORDER BY id ASC LIMIT 1");
        const settingsRow = settingsRows[0];

        const [notifRows] = await db.query("SELECT id, type, description, enabled FROM notification_settings ORDER BY id ASC");

        res.json({
        success: true,
        settings: settingsRow
            ? {
                organizationName: settingsRow.organization_name,
                address: settingsRow.address,
                phone: settingsRow.phone || "",
                email: settingsRow.email,
                website: settingsRow.website || "",
                timezone: settingsRow.timezone,
                currency: settingsRow.currency,
                language: settingsRow.language,
            }
            : null,
        darkMode: !!(settingsRow && settingsRow.dark_mode),
        notifState: notifRows.map((n) => ({
            id: n.id,
            type: n.type,
            description: n.description,
            enabled: !!n.enabled,
        })),
        });
    } catch (err) {
        console.error("GET settings error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
    });

    /**
     * PUT /api/settings
     * Admin only recommended
     */
    router.put("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const { settings, notifState, darkMode } = req.body || {};

        if (!settings) {
        return res.status(400).json({ success: false, message: "Missing settings payload" });
        }

        // update system_settings (single row)
        await db.query(
        `UPDATE system_settings SET
            organization_name = ?,
            address = ?,
            phone = ?,
            email = ?,
            website = ?,
            timezone = ?,
            currency = ?,
            language = ?,
            dark_mode = ?
        WHERE id = (SELECT id FROM (SELECT id FROM system_settings ORDER BY id ASC LIMIT 1) x)`,
        [
            settings.organizationName || "",
            settings.address || "",
            settings.phone || null,
            settings.email || "",
            settings.website || null,
            settings.timezone || "UTC",
            settings.currency || "USD",
            settings.language || "English",
            darkMode ? 1 : 0,
        ]
        );

        // notifications: update existing by id
        if (Array.isArray(notifState)) {
        for (const n of notifState) {
            if (!n?.id) continue;
            await db.query(
            "UPDATE notification_settings SET enabled = ? WHERE id = ?",
            [n.enabled ? 1 : 0, n.id]
            );
        }
        }

        res.json({ success: true, message: "Settings saved successfully." });
    } catch (err) {
        console.error("PUT settings error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
    });

    module.exports = router;
