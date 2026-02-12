// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const childrenRoutes = require("./routes/children");
const milestoneRoutes = require("./routes/milestones");
const settingsRoutes = require("./routes/settings");
const alertsRoutes = require("./routes/alerts");

const donationsRoutes = require("./routes/donations");
const paymongoWebhookRoutes = require("./routes/paymongoWebhook");
const dashboardRoutes = require("./routes/dashboard");

// ✅ NEW
const reportsRoutes = require("./routes/reports");
const auditTrailRoutes = require("./routes/auditTrail");

const app = express();

app.use(cors({ origin: true, credentials: false }));

// Webhook FIRST
app.use("/webhook/paymongo", paymongoWebhookRoutes);

// JSON for normal API routes
app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/alerts", alertsRoutes);

app.use("/api/donations", donationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ NEW
app.use("/api/reports", reportsRoutes);
app.use("/api/audit-trail", auditTrailRoutes);

app.get("/", (_req, res) => res.send("Backend running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
