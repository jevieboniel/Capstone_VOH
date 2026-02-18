import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Settings,
  Database,
  Bell,
  Globe,
  Users,
  Lock,
  Download,
  Upload,
  CheckCircle,
  Save,
} from "lucide-react";

/* ---------------- Tailwind UI helpers ---------------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm
        dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 ${className}`}>
      {children}
    </h3>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 ${className}`}
    />
  );
}

function Button({ children, variant = "default", className = "", type = "button", ...props }) {
  const base =
    "inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "outline"
      ? "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
      : "bg-indigo-600 text-white hover:bg-indigo-700";

  return (
    <button type={type} {...props} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
      aria-pressed={checked}
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* -------------------------------- Constants -------------------------------- */

const API_ORIGIN = "http://localhost:5000";

const DEFAULT_SETTINGS = {
  organizationName: "Village of Hope Orphanage",
  address: "123 Hope Street, Nairobi, Kenya",
  phone: "+254700123456",
  email: "admin@villageofhope.org",
  website: "www.villageofhope.org",

  // ✅ Security defaults (match backend)
  passwordMinLength: 8,
  passwordExpiryDays: 90,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: false,
  failedLoginLimit: 5,
  lockoutMinutes: 15,
};

/* -------------------------------- Sections -------------------------------- */

function GeneralSettingsSection({ draftSettings, setDraftField, onReset, saving, loading }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Settings className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization Name
              </label>
              <Input
                value={draftSettings.organizationName ?? ""}
                onChange={(e) => setDraftField("organizationName", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <Input
                type="email"
                value={draftSettings.email ?? ""}
                onChange={(e) => setDraftField("email", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <Input value={draftSettings.address ?? ""} onChange={(e) => setDraftField("address", e.target.value)} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <Input value={draftSettings.phone ?? ""} onChange={(e) => setDraftField("phone", e.target.value)} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
              <Input value={draftSettings.website ?? ""} onChange={(e) => setDraftField("website", e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={onReset} disabled={saving || loading}>
              Reset Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettingsSection({ draftSettings, setDraftField }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Lock className="h-5 w-5" />
            Password Policy
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Password Length
              </label>
              <Input
                type="number"
                value={draftSettings.passwordMinLength ?? 8}
                onChange={(e) => setDraftField("passwordMinLength", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Expiry (days)
              </label>
              <Input
                type="number"
                value={draftSettings.passwordExpiryDays ?? 90}
                onChange={(e) => setDraftField("passwordExpiryDays", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            {[
              { key: "requireUppercase", label: "Require uppercase letters" },
              { key: "requireLowercase", label: "Require lowercase letters" },
              { key: "requireNumbers", label: "Require numbers" },
              { key: "requireSpecial", label: "Require special characters" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!draftSettings[item.key]}
                  onChange={(e) => setDraftField(item.key, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {item.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Users className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Failed Login Attempts Limit
            </label>
            <Input
              type="number"
              value={draftSettings.failedLoginLimit ?? 5}
              onChange={(e) => setDraftField("failedLoginLimit", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Lockout Duration (minutes)
            </label>
            <Input
              type="number"
              value={draftSettings.lockoutMinutes ?? 15}
              onChange={(e) => setDraftField("lockoutMinutes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettingsSection({ notifState, setNotifState, onSaveNotificationsOnly, saving, loading }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>

          <Button variant="outline" onClick={onSaveNotificationsOnly} disabled={saving || loading} className="h-10 px-4">
            Save Notifications
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {notifState.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4
                    dark:border-gray-800 dark:bg-gray-950/40"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{n.type}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{n.description}</p>
                </div>

                <Toggle
                  checked={n.enabled}
                  onChange={(next) =>
                    setNotifState((prev) => prev.map((x) => (x.id === n.id ? { ...x, enabled: next } : x)))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BackupSettingsSection({
  systemStats,
  createBackup,
  restoreBackup,
  backupLoading,
  backupList,
  backupListLoading,
  downloadBackup,
}) {
  const fileRef = useRef(null);

  const latest = backupList?.[0];
  const latestDate = latest?.createdAt ? new Date(latest.createdAt).toLocaleString() : "No backups yet";
  const latestSize = latest?.size ? `${(latest.size / (1024 * 1024)).toFixed(2)} MB` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-green-50 p-5 text-center border border-green-100 dark:bg-green-950/30 dark:border-green-900">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">System Health</p>
              <p className="text-green-700 text-sm mt-1">Excellent</p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-center border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900">
              <Database className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">Storage Used</p>
              <p className="text-blue-700 text-sm mt-1">
                {systemStats.storage.used}GB / {systemStats.storage.total}GB
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5 text-center border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900">
              <Globe className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">Uptime</p>
              <p className="text-purple-700 text-sm mt-1">{systemStats.uptime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Download className="h-5 w-5" />
            Backup Management
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-green-50 p-5 border border-green-100 dark:bg-green-950/30 dark:border-green-900">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Last Backup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {backupListLoading ? "Loading..." : latestDate}
                {!backupListLoading && latestSize ? ` — ${latestSize}` : ""}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {latest ? "Available" : "None"}
            </Badge>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".sql"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restoreBackup(f);
              e.target.value = "";
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={createBackup} disabled={backupLoading}>
              <Download className="mr-2 h-4 w-4" />
              {backupLoading ? "Working..." : "Create Backup"}
            </Button>

            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={backupLoading}>
              <Upload className="mr-2 h-4 w-4" />
              {backupLoading ? "Working..." : "Restore Backup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="h-5 w-5" />
            Backup History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {backupListLoading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading backups...</p>
          ) : backupList.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No backups found.</p>
          ) : (
            <div className="space-y-3">
              {backupList.slice(0, 10).map((b) => (
                <div
                  key={b.filename}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-gray-950/40"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{b.filename}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}
                      {b.size ? ` • ${(b.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                    </p>
                  </div>

                  <Button variant="outline" className="h-10 px-4" onClick={() => downloadBackup(b.filename)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- Main Component -------------------------------- */

export default function Setting() {
  const systemStats = useMemo(
    () => ({
      version: "2.1.4",
      lastUpdate: "2025-09-01",
      uptime: "99.9%",
      storage: { used: 45.2, total: 100 },
      backupStatus: "Completed",
      lastBackup: "2025-09-03T02:00:00Z",
    }),
    []
  );

  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupList, setBackupList] = useState([]);
  const [backupListLoading, setBackupListLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    if (hasDarkClass) return true;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);

  const [notifState, setNotifState] = useState([
    { id: 1, type: "System Update", enabled: true, description: "System maintenance and updates" },
    { id: 2, type: "Health Alerts", enabled: true, description: "Health check-up reminders" },
    { id: 3, type: "Development Milestones", enabled: true, description: "Milestone progress notifications" },
    { id: 4, type: "Donation Alerts", enabled: false, description: "New donation notifications" },
    { id: 5, type: "User Activity", enabled: true, description: "User login and activity alerts" },
    { id: 6, type: "Data Backup", enabled: true, description: "Backup completion notifications" },
  ]);

  // LOAD settings from backend
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setLoading(true);

    fetch(`${API_ORIGIN}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) return;

        if (data.settings) setSettings(data.settings);
        if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
        if (Array.isArray(data.notifState)) setNotifState(data.notifState);
      })
      .catch((err) => console.error("Load settings error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Sync draft from canonical ONLY when not editing
  useEffect(() => {
    if (isDirty) return;
    setDraftSettings(settings || DEFAULT_SETTINGS);
  }, [settings, isDirty]);

  const setDraftField = (key, value) => {
    setIsDirty(true);
    setDraftSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        alert("Not logged in.");
        return;
      }

      setSaving(true);

      const res = await fetch(`${API_ORIGIN}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: draftSettings,
          notifState,
          darkMode,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save");

      setSettings(draftSettings);
      setIsDirty(false);

      alert("Settings saved successfully ✅");
    } catch (err) {
      console.error("Save settings error:", err);
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Save Notifications only (optional button)
  const saveNotificationsOnly = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return alert("Not logged in.");

    try {
      setSaving(true);

      const res = await fetch(`${API_ORIGIN}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: draftSettings, notifState, darkMode }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      alert("Notifications saved ✅");
    } catch (e) {
      alert(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const fetchBackups = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      setBackupListLoading(true);
      const res = await fetch(`${API_ORIGIN}/api/backup/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load backups");

      setBackupList(Array.isArray(data.backups) ? data.backups : []);
    } catch (e) {
      console.error(e);
    } finally {
      setBackupListLoading(false);
    }
  };

  const downloadBackup = async (filename) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return alert("Not logged in.");

    try {
      const res = await fetch(`${API_ORIGIN}/api/backup/download/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Download failed");
    }
  };

  useEffect(() => {
    if (activeSection === "backup") fetchBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Backup: Create (server-stored + download)
  const createBackup = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return alert("Not logged in.");

    try {
      setBackupLoading(true);

      const res = await fetch(`${API_ORIGIN}/api/backup/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Backup failed");

      // Download the created backup
      await downloadBackup(data.filename);

      await fetchBackups();
      alert("Backup created ✅");
    } catch (e) {
      alert(e.message || "Backup failed");
    } finally {
      setBackupLoading(false);
    }
  };

  // Backup: Restore
  const restoreBackup = async (file) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return alert("Not logged in.");
    if (!file) return;

    const ok = window.confirm("This will overwrite the database. Continue?");
    if (!ok) return;

    try {
      setBackupLoading(true);

      const form = new FormData();
      form.append("backup", file);

      const res = await fetch(`${API_ORIGIN}/api/backup/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Restore failed");

      await fetchBackups();
      alert("Backup restored ✅");
    } catch (e) {
      alert(e.message || "Restore failed");
    } finally {
      setBackupLoading(false);
    }
  };

  const resetDraft = () => {
    setDraftSettings(settings || DEFAULT_SETTINGS);
    setIsDirty(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              System Settings
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Configure system preferences and security settings
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {darkMode ? "Dark" : "Default"}
              </span>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </div>

            <Button onClick={handleSaveAll} className="w-full sm:w-auto" disabled={saving || loading}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-sm text-gray-600 dark:text-gray-300">
            Loading settings...
          </div>
        ) : null}

        {/* Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={activeSection === "general" ? "default" : "outline"}
                className="h-11 px-5 rounded-xl whitespace-nowrap"
                onClick={() => setActiveSection("general")}
              >
                General
              </Button>

              <Button
                variant={activeSection === "security" ? "default" : "outline"}
                className="h-11 px-5 rounded-xl whitespace-nowrap"
                onClick={() => setActiveSection("security")}
              >
                Security
              </Button>

              <Button
                variant={activeSection === "notifications" ? "default" : "outline"}
                className="h-11 px-5 rounded-xl whitespace-nowrap"
                onClick={() => setActiveSection("notifications")}
              >
                Notifications
              </Button>

              <Button
                variant={activeSection === "backup" ? "default" : "outline"}
                className="h-11 px-5 rounded-xl whitespace-nowrap"
                onClick={() => setActiveSection("backup")}
              >
                Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Content */}
        {activeSection === "general" && (
          <GeneralSettingsSection
            draftSettings={draftSettings}
            setDraftField={setDraftField}
            onReset={resetDraft}
            saving={saving}
            loading={loading}
          />
        )}

        {activeSection === "security" && <SecuritySettingsSection draftSettings={draftSettings} setDraftField={setDraftField} />}

        {activeSection === "notifications" && (
          <NotificationSettingsSection
            notifState={notifState}
            setNotifState={setNotifState}
            onSaveNotificationsOnly={saveNotificationsOnly}
            saving={saving}
            loading={loading}
          />
        )}

        {activeSection === "backup" && (
          <BackupSettingsSection
            systemStats={systemStats}
            createBackup={createBackup}
            restoreBackup={restoreBackup}
            backupLoading={backupLoading}
            backupList={backupList}
            backupListLoading={backupListLoading}
            downloadBackup={downloadBackup}
          />
        )}
      </div>
    </div>
  );
}
