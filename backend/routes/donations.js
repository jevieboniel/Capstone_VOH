// backend/routes/donations.js
const express = require("express");
const axios = require("axios");
const pool = require("../db");
const { logAudit } = require("../utils/audit");
const { verifyToken } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const DON_PERM = "Donations";


const router = express.Router();

const paymongo = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  auth: { username: process.env.PAYMONGO_SECRET_KEY, password: "" },
  headers: { "Content-Type": "application/json" },
});

// ✅ Create PayMongo payment intent (Pending record in DB)
router.post("/create-intent", verifyToken, requirePermission(DON_PERM), async (req, res) => {
  try {
    const {
      amount,
      currency = "PHP",
      purpose = "Donation",
      donor_name = null,
      donor_email = null,
      type = "One-time",
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // PayMongo expects amount in smallest unit (PHP centavos)
    const amountSmallest = Math.round(Number(amount) * 100);

    const resp = await paymongo.post("/payment_intents", {
      data: {
        attributes: {
          amount: amountSmallest,
          currency,
          description: purpose,
          payment_method_allowed: ["card", "gcash"],
        },
      },
    });

    const pi = resp.data.data;

    await pool.query(
      `INSERT INTO donations
      (paymongo_payment_intent_id, amount, currency, purpose, type, status, donor_name, donor_email)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [pi.id, Number(amount), currency, purpose, type, donor_name, donor_email]
    );

    try {
      await logAudit(req, {
        action: "CREATE",
        module: "Donation Management",
        resource: "Donation",
        resourceId: pi.id,
        details: `Created donation intent: PHP ${amount} (${type})`,
      });
    } catch (e) {
      console.error("Audit log failed (CREATE donation intent):", e);
    }

    res.json({
      payment_intent_id: pi.id,
      client_key: pi.attributes.client_key,
      status: pi.attributes.status,
    });
  } catch (err) {
    console.error("create-intent:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});

// ✅ List donations (supports search query q)
router.get("/", verifyToken, requirePermission(DON_PERM), async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();

    const [rows] = await pool.query(
      `SELECT *
      FROM donations
      WHERE (? = '' OR LOWER(purpose) LIKE CONCAT('%', ?, '%') OR LOWER(method) LIKE CONCAT('%', ?, '%'))
      ORDER BY created_at DESC`,
      [q, q, q]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /donations:", err.message);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
});

// ✅ Dashboard metrics (overview cards + charts)
router.get("/metrics", verifyToken, requirePermission(DON_PERM), async (_req, res) => {
  try {
    // totals
    const [[totals]] = await pool.query(
      `SELECT
          COALESCE(SUM(amount),0) AS totalAmount,
          COUNT(*) AS totalTransactions,
          SUM(CASE WHEN type='Monthly' THEN 1 ELSE 0 END) AS recurringDonors
      FROM donations
      WHERE status='Completed'`
    );

    // last 9 months trend (amount + donors = transactions)
    const [trend] = await pool.query(
      `SELECT
          DATE_FORMAT(created_at, '%b') AS month,
          YEAR(created_at) AS yr,
          COALESCE(SUM(amount),0) AS amount,
          COUNT(*) AS donors
      FROM donations
      WHERE status='Completed'
      GROUP BY yr, month
      ORDER BY yr DESC, MIN(created_at) DESC
      LIMIT 9`
    );

    // purposes distribution by total amount
    const [purposesRaw] = await pool.query(
      `SELECT
          COALESCE(purpose,'Unspecified') AS name,
          COALESCE(SUM(amount),0) AS total
      FROM donations
      WHERE status='Completed'
      GROUP BY name
      ORDER BY total DESC
      LIMIT 10`
    );

    const sumPurpose = purposesRaw.reduce((s, r) => s + Number(r.total), 0) || 1;
    const purposes = purposesRaw.map((r) => ({
      name: r.name,
      value: Math.round((Number(r.total) / sumPurpose) * 100),
    }));

    // recent 3
    const [recent] = await pool.query(
      `SELECT * FROM donations
      WHERE status='Completed'
      ORDER BY created_at DESC
      LIMIT 3`
    );

    res.json({
      totals: {
        totalAmount: Number(totals.totalAmount),
        totalTransactions: Number(totals.totalTransactions),
        recurringDonors: Number(totals.recurringDonors),
      },
      trend: trend.reverse(), // oldest -> newest for chart
      purposes,
      recent,
    });
  } catch (err) {
    console.error("GET /donations/metrics:", err.message);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

// ✅ CSV export from backend (optional)
// GET /api/donations/export.csv?q=...
router.get("/export.csv", verifyToken, requirePermission(DON_PERM), async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();

    const [rows] = await pool.query(
      `SELECT paymongo_payment_id, paymongo_payment_intent_id, amount, currency, created_at, purpose, method, status
      FROM donations
      WHERE (? = '' OR LOWER(purpose) LIKE CONCAT('%', ?, '%') OR LOWER(method) LIKE CONCAT('%', ?, '%'))
      ORDER BY created_at DESC`,
      [q, q, q]
    );

    const header = ["Payment ID", "Payment Intent ID", "Amount", "Currency", "DateTime", "Purpose", "Method", "Status"];
    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((r) =>
          [
            r.paymongo_payment_id || "",
            r.paymongo_payment_intent_id || "",
            r.amount,
            r.currency,
            new Date(r.created_at).toISOString(),
            (r.purpose || "").replaceAll(",", " "),
            (r.method || "").replaceAll(",", " "),
            r.status,
          ].join(",")
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=donations_export.csv");
    res.send(csv);
  } catch (err) {
    console.error("GET /donations/export.csv:", err.message);
    res.status(500).json({ message: "Failed to export csv" });
  }
});

// ✅ Create Payment Method (backend calls PayMongo)
router.post("/create-payment-method", verifyToken, requirePermission(DON_PERM), async (req, res) => {
  try {
    const { method, billing, card } = req.body;

    const payload = {
      data: {
        attributes: {
          type: method === "card" ? "card" : "gcash",
          billing: billing || {},
        },
      },
    };

    // ✅ For CARD, PayMongo needs "details.card_number" (not "card.number")
    if (method === "card") {
      if (!card?.number || !card?.exp_month || !card?.exp_year || !card?.cvc) {
        return res.status(400).json({ message: "Missing card details" });
      }

      payload.data.attributes.details = {
        card_number: String(card.number).replace(/\s+/g, ""), // remove spaces
        exp_month: Number(card.exp_month),
        exp_year: Number(card.exp_year),
        cvc: String(card.cvc),
      };
    }

    // Use your existing axios instance (paymongo)
    const resp = await paymongo.post("/payment_methods", payload);

    res.json({ payment_method_id: resp.data.data.id });
  } catch (err) {
    console.error("create-payment-method:", err.response?.data || err.message);
    res
      .status(500)
      .json({ message: err.response?.data?.errors?.[0]?.detail || "Failed to create payment method" });
  }
});

// ✅ Attach Payment Method to Payment Intent
router.post("/attach-payment-method", verifyToken, requirePermission(DON_PERM), async (req, res) => {
  try {
    const { payment_intent_id, payment_method_id } = req.body;

    const resp = await paymongo.post(`/payment_intents/${payment_intent_id}/attach`, {
      data: {
        attributes: {
          payment_method: payment_method_id,
          return_url: "http://localhost:3000/donate-success",
        },
      },
    });

    res.json(resp.data);
  } catch (err) {
    console.error("attach-payment-method:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to attach payment method" });
  }
});

module.exports = router;
