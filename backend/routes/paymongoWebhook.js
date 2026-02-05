    // backend/routes/paymongoWebhook.js
    const express = require("express");
    const crypto = require("crypto");
    const pool = require("../db");
    const { sendEmail } = require("../utils/gmail");

    const router = express.Router();

    function parseSignature(header) {
    // Common format: "t=...,v1=...."
    // Some docs show variants; we’ll support multiple keys.
    const parts = header.split(",").map((x) => x.trim());
    const out = {};
    for (const p of parts) {
        const [k, v] = p.split("=");
        out[k] = v;
    }
    return out; // { t, v1 } (or others)
    }

    function timingSafeEqualHex(a, b) {
    try {
        const aBuf = Buffer.from(a, "hex");
        const bBuf = Buffer.from(b, "hex");
        if (aBuf.length !== bBuf.length) return false;
        return crypto.timingSafeEqual(aBuf, bBuf);
    } catch {
        return false;
    }
    }

    // IMPORTANT: raw body required
    router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        const sigHeader = req.header("paymongo-signature") || req.header("Paymongo-Signature");
        if (!sigHeader) return res.status(400).send("Missing paymongo-signature");

        if (!process.env.PAYMONGO_WEBHOOK_SECRET) {
        console.error("Missing PAYMONGO_WEBHOOK_SECRET in .env");
        return res.status(500).send("Webhook secret not configured");
        }

        const sig = parseSignature(sigHeader);
        const timestamp = sig.t;

        // support v1 (common) + te/li fallback
        const expected = sig.v1 || sig.te || sig.li;

        if (!timestamp || !expected) return res.status(400).send("Bad signature header");

        const rawBody = req.body.toString("utf8");
        const signedPayload = `${timestamp}.${rawBody}`;

        const computed = crypto
        .createHmac("sha256", process.env.PAYMONGO_WEBHOOK_SECRET)
        .update(signedPayload)
        .digest("hex");

        if (!timingSafeEqualHex(computed, expected)) {
        console.error("Invalid webhook signature");
        return res.status(401).send("Invalid signature");
        }

        const event = JSON.parse(rawBody);
        const eventId = event?.data?.id;
        const eventType = event?.data?.attributes?.type;

        // Deduplicate webhook events (optional, but good)
        if (eventId) {
        await pool.query(
            `INSERT IGNORE INTO paymongo_webhook_events (event_id, event_type, payload)
            VALUES (?, ?, ?)`,
            [eventId, eventType || null, JSON.stringify(event)]
        );
        }

        const resource = event?.data?.attributes?.data;

        const paymentIntentId =
        resource?.attributes?.payment_intent_id ||
        resource?.attributes?.payment_intent?.id ||
        resource?.attributes?.payment_intent ||
        null;

        const paymentId = resource?.id || null;
        const method = resource?.attributes?.source?.type || resource?.attributes?.payment_method?.type || null;

        if (!paymentIntentId) return res.status(200).send("OK");

        if (eventType === "payment.paid") {
        await pool.query(
            `UPDATE donations
            SET status='Completed',
                paymongo_payment_id=?,
                method=COALESCE(method, ?)
            WHERE paymongo_payment_intent_id=?`,
            [paymentId, method, paymentIntentId]
        );

        const [[donation]] = await pool.query(
            `SELECT * FROM donations WHERE paymongo_payment_intent_id=? LIMIT 1`,
            [paymentIntentId]
        );

        if (donation?.donor_email) {
            await sendEmail({
            to: donation.donor_email,
            subject: "Thank you for your donation ❤️",
            html: `
                <div style="font-family: Arial, sans-serif;">
                <h2>Donation Received</h2>
                <p>Hi ${donation.donor_name || "Donor"},</p>
                <p>We received your donation of <b>${donation.currency} ${donation.amount}</b>.</p>
                <p>Purpose: <b>${donation.purpose || "Donation"}</b></p>
                <p>Status: <b>Completed</b></p>
                <p>Thank you! 🙏</p>
                </div>
            `,
            });
        }
        }

        if (eventType === "payment.failed") {
        await pool.query(
            `UPDATE donations
            SET status='Failed',
                paymongo_payment_id=?
            WHERE paymongo_payment_intent_id=?`,
            [paymentId, paymentIntentId]
        );
        }

        return res.status(200).send("OK");
    } catch (err) {
        console.error("paymongo webhook error:", err);
        return res.status(500).send("Webhook error");
    }
    });

    module.exports = router;
