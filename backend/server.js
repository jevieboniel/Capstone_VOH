require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const childrenRoutes = require("./routes/children");
const milestoneRoutes = require("./routes/milestones");
const healthRecords = require("./routes/healthRecords");
const educationRecords = require("./routes/educationRecords");

const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/health-records", healthRecords);
app.use("/api/education-records", educationRecords);

app.get("/", (_req, res) => {
    res.send("Backend running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
