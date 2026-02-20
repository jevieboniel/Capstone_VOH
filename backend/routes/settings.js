// backend/routes/settings.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");

/**
 * GET /api/settings
 * - load general + notifications + security/access control
 * - NOTE: darkMode removed (handled elsewhere, e.g. TopNav/localStorage)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [settingsRows] = await db.query(
      "SELECT * FROM system_settings ORDER BY id ASC LIMIT 1"
    );
    const settingsRow = settingsRows[0];

    const [notifRows] = await db.query(
      "SELECT id, type, description, enabled FROM notification_settings ORDER BY id ASC"
    );

    res.json({
      success: true,
      settings: settingsRow
        ? {
            // General
            organizationName: settingsRow.organization_name,
            address: settingsRow.address,
            phone: settingsRow.phone || "",
            email: settingsRow.email,
            website: settingsRow.website || "",
            timezone: settingsRow.timezone,
            currency: settingsRow.currency,
            language: settingsRow.language,

            // ✅ Security: Password Policy (DB-backed)
            passwordMinLength: Number(settingsRow.password_min_length ?? 8),
            passwordExpiryDays: Number(settingsRow.password_expiry_days ?? 90),
            requireUppercase: !!settingsRow.require_uppercase,
            requireLowercase: !!settingsRow.require_lowercase,
            requireNumbers: !!settingsRow.require_numbers,
            requireSpecial: !!settingsRow.require_special,

            // ✅ Security: Access Control (DB-backed)
            failedLoginLimit: Number(settingsRow.failed_login_limit ?? 5),
            lockoutMinutes: Number(settingsRow.lockout_minutes ?? 15),
          }
        : null,

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
 * - Save general/security + notifState
 * - NOTE: darkMode removed from this endpoint
 */
router.put("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { settings, notifState } = req.body || {};

    if (!settings) {
      return res
        .status(400)
        .json({ success: false, message: "Missing settings payload" });
    }

    // Clamp helpers (avoid bad values breaking login)
    const toInt = (v, fallback) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : fallback;
    };
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const passwordMinLength = clamp(toInt(settings.passwordMinLength, 8), 6, 128);
    const passwordExpiryDays = clamp(toInt(settings.passwordExpiryDays, 90), 0, 3650); // 0 = disable expiry
    const failedLoginLimit = clamp(toInt(settings.failedLoginLimit, 5), 1, 50);
    const lockoutMinutes = clamp(toInt(settings.lockoutMinutes, 15), 1, 1440);

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

        -- ✅ security fields
        password_min_length = ?,
        password_expiry_days = ?,
        require_uppercase = ?,
        require_lowercase = ?,
        require_numbers = ?,
        require_special = ?,
        failed_login_limit = ?,
        lockout_minutes = ?

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

        // ✅ security values
        passwordMinLength,
        passwordExpiryDays,
        settings.requireUppercase ? 1 : 0,
        settings.requireLowercase ? 1 : 0,
        settings.requireNumbers ? 1 : 0,
        settings.requireSpecial ? 1 : 0,
        failedLoginLimit,
        lockoutMinutes,
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