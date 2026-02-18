// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const childrenRoutes = require("./routes/children");
const milestoneRoutes = require("./routes/milestones");
const settingsRoutes = require("./routes/settings");
const alertsRoutes = require("./routes/alerts");

const donationsRoutes = require("./routes/donations");
const paymongoWebhookRoutes = require("./routes/paymongoWebhook");
const dashboardRoutes = require("./routes/dashboard");
const reportsRoutes = require("./routes/reports");
const auditTrailRoutes = require("./routes/auditTrail");
const backupRoutes = require("./routes/backup");

const app = express();

/* ---------------- CORS ---------------- */
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// Webhook FIRST
app.use("/webhook/paymongo", paymongoWebhookRoutes);

// JSON for normal API routes
app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/alerts", alertsRoutes);

app.use("/api/donations", donationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/audit-trail", auditTrailRoutes);
app.use("/api/backup", backupRoutes);

app.get("/", (_req, res) => res.send("Backend running ✅"));

/* ---------------- Socket.io ---------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available to routes via req.app.get("io")
app.set("io", io);

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SECRET_KEY || process.env.JWT_KEY || "dev_secret_change_me";

io.use((socket, next) => {
  try {
    // Expect token in: socket.handshake.auth.token
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // { id, role, ... } based on your login payload
    return next();
  } catch (e) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const id = socket.user?.id;
  const role = socket.user?.role;

  if (id) socket.join(`user:${id}`);
  if (role) socket.join(`role:${role}`);

  // optional: acknowledge connection
  socket.emit("socket:ready", {
    ok: true,
    userId: id,
    role,
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server + Socket running on http://localhost:${PORT}`));
