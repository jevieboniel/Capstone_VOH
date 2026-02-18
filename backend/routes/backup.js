const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");
const multer = require("multer");

const db = require("../db");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const { emitIfEnabled } = require("../utils/realtimeNotify"); // ✅ NEW

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB max upload
});

const quote = (p) => `"${p}"`;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 200 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve({ stdout, stderr });
    });
  });
}

function mysqlExe(name) {
  // Use XAMPP bin if configured, else fallback to PATH
  const bin = process.env.MYSQL_BIN;
  return bin ? path.join(bin, name) : name;
}

function ensureBackupDir() {
  const dir = process.env.BACKUP_DIR || "backups";
  const abs = path.join(__dirname, "..", dir);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  return abs;
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// Create temp my.cnf so password isn't visible in CLI process list
function writeTempCnf() {
  const DB_HOST = process.env.DB_HOST || "127.0.0.1";
  const DB_PORT = process.env.DB_PORT || "3306";
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD || "";

  if (!DB_USER) throw new Error("Missing DB_USER env");

  const cnfPath = path.join(os.tmpdir(), `mysql-${nowStamp()}.cnf`);
  const content =
    `[client]\n` +
    `host=${DB_HOST}\n` +
    `port=${DB_PORT}\n` +
    `user=${DB_USER}\n` +
    (DB_PASSWORD ? `password=${DB_PASSWORD}\n` : "");

  fs.writeFileSync(cnfPath, content, { encoding: "utf8" });
  return cnfPath;
}

async function logAudit(req, { action, module, resource, resource_id, details, severity = "info", meta = null }) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      null;

    await db.query(
      `INSERT INTO audit_trail
       (user_id, user_name, user_role, action, module, resource, resource_id, details, ip_address, user_agent, severity, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.id || null,
        req.user?.name || null,
        req.user?.role || null,
        action,
        module,
        resource || null,
        resource_id || null,
        details || null,
        ip,
        req.headers["user-agent"] || null,
        severity,
        meta ? JSON.stringify(meta) : null,
      ]
    );
  } catch (e) {
    console.error("audit log failed:", e.message);
  }
}

/**
 * GET /api/backup/status
 */
router.get("/status", verifyToken, requireAdmin, async (_req, res) => {
  res.json({ success: true, backupStatus: "OK" });
});

/**
 * GET /api/backup/list
 */
router.get("/list", verifyToken, requireAdmin, async (_req, res) => {
  try {
    const dir = ensureBackupDir();
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".sql"))
      .map((f) => {
        const p = path.join(dir, f);
        const st = fs.statSync(p);
        return {
          filename: f,
          size: st.size,
          createdAt: st.birthtime || st.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, backups: files });
  } catch (err) {
    console.error("backup list error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/backup/download/:filename
 */
router.get("/download/:filename", verifyToken, requireAdmin, async (req, res) => {
  try {
    const dir = ensureBackupDir();
    const filename = String(req.params.filename || "");

    if (
      !filename.toLowerCase().endsWith(".sql") ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ success: false, message: "Invalid filename" });
    }

    const full = path.join(dir, filename);
    if (!fs.existsSync(full)) return res.status(404).json({ success: false, message: "File not found" });

    return res.download(full, filename);
  } catch (err) {
    console.error("backup download error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/backup/create
 */
router.post("/create", verifyToken, requireAdmin, async (req, res) => {
  let cnfPath = null;

  try {
    const DB_NAME = process.env.DB_NAME;
    if (!DB_NAME) return res.status(400).json({ success: false, message: "Missing DB_NAME env" });

    const dir = ensureBackupDir();
    const filename = `voh_db-${nowStamp()}.sql`;
    const outPath = path.join(dir, filename);

    cnfPath = writeTempCnf();

    const dump = mysqlExe("mysqldump.exe");
    const cmd =
      `${quote(dump)} --defaults-extra-file=${quote(cnfPath)} ` +
      `--single-transaction --routines --events --triggers ` +
      `${DB_NAME} > ${quote(outPath)}`;

    await run(cmd);

    // rotate old backups
    const keep = parseInt(process.env.BACKUP_KEEP || "10", 10);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".sql"))
      .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtime.getTime() }))
      .sort((a, b) => b.t - a.t);

    for (const old of files.slice(keep)) {
      fs.unlink(path.join(dir, old.f), () => {});
    }

    await logAudit(req, {
      action: "create",
      module: "backup",
      resource: "backup_file",
      resource_id: filename,
      details: "Created database backup",
      meta: { filename },
    });

    // ✅ REALTIME: Data Backup
    const io = req.app.get("io");
    await emitIfEnabled(
      io,
      {
        type: "Data Backup",
        title: "Backup Created",
        message: `Database backup created: ${filename}`,
        severity: "info",
      },
      { role: "Admin" }
    );

    res.json({ success: true, message: "Backup created", filename });
  } catch (err) {
    console.error("backup create error:", err.message);

    await logAudit(req, {
      action: "create",
      module: "backup",
      resource: "backup_file",
      details: "Backup failed",
      severity: "error",
      meta: { error: err.message },
    });

    // ✅ REALTIME: Data Backup failed
    const io = req.app.get("io");
    await emitIfEnabled(
      io,
      {
        type: "Data Backup",
        title: "Backup Failed",
        message: `Backup failed: ${err.message}`,
        severity: "warning",
      },
      { role: "Admin" }
    );

    res.status(500).json({ success: false, message: "Backup failed", error: err.message });
  } finally {
    if (cnfPath) fs.unlink(cnfPath, () => {});
  }
});

/**
 * POST /api/backup/restore
 */
router.post("/restore", verifyToken, requireAdmin, upload.single("backup"), async (req, res) => {
  let cnfPath = null;

  try {
    const DB_NAME = process.env.DB_NAME;
    if (!DB_NAME) return res.status(400).json({ success: false, message: "Missing DB_NAME env" });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No backup file uploaded" });

    const original = (file.originalname || "").toLowerCase();
    if (!original.endsWith(".sql")) {
      fs.unlink(file.path, () => {});
      return res.status(400).json({ success: false, message: "Only .sql backups are allowed" });
    }

    cnfPath = writeTempCnf();

    const mysql = mysqlExe("mysql.exe");
    const cmd = `${quote(mysql)} --defaults-extra-file=${quote(cnfPath)} ${DB_NAME} < ${quote(file.path)}`;

    await run(cmd);

    // move uploaded file to backups folder for history
    const dir = ensureBackupDir();
    const savedName = `restored-${nowStamp()}.sql`;
    fs.renameSync(file.path, path.join(dir, savedName));

    await logAudit(req, {
      action: "restore",
      module: "backup",
      resource: "backup_file",
      resource_id: savedName,
      details: "Restored database backup",
      meta: { savedName },
      severity: "warning",
    });

    // ✅ REALTIME: restore success
    const io = req.app.get("io");
    await emitIfEnabled(
      io,
      {
        type: "Data Backup",
        title: "Database Restored",
        message: `Database restored successfully. Saved file: ${savedName}`,
        severity: "warning",
      },
      { role: "Admin" }
    );

    res.json({ success: true, message: "Database restored successfully.", savedName });
  } catch (err) {
    console.error("backup restore error:", err.message);
    if (req.file?.path) fs.unlink(req.file.path, () => {});

    await logAudit(req, {
      action: "restore",
      module: "backup",
      resource: "backup_file",
      details: "Restore failed",
      severity: "critical",
      meta: { error: err.message },
    });

    // ✅ REALTIME: restore failed
    const io = req.app.get("io");
    await emitIfEnabled(
      io,
      {
        type: "Data Backup",
        title: "Restore Failed",
        message: `Restore failed: ${err.message}`,
        severity: "warning",
      },
      { role: "Admin" }
    );

    res.status(500).json({ success: false, message: "Restore failed", error: err.message });
  } finally {
    if (cnfPath) fs.unlink(cnfPath, () => {});
  }
});

module.exports = router;
