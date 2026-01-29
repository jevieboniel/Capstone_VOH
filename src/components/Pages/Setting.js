    import React, { useMemo, useState, useEffect } from "react";
    import {
    Settings,
    Shield,
    Database,
    Bell,
    Mail,
    Globe,
    Users,
    Lock,
    Download,
    Upload,
    AlertCircle,
    CheckCircle,
    Save,
    } from "lucide-react";

    /* ---------------- Tailwind UI helpers (same style system as Children.js) ---------------- */

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

    function Select({ className = "", children, ...props }) {
    return (
        <select
        {...props}
        className={`w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 ${className}`}
        >
        {children}
        </select>
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

    /* Toggle switch (matches your screenshot style) */
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

    /* -------------------------------- Page -------------------------------- */

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

    // ✅ Option 2: local toggle, global effect
    const [darkMode, setDarkMode] = useState(() => {
        // Prefer actual <html> state first (in case index.js already applied it)
        const hasDarkClass = document.documentElement.classList.contains("dark");
        if (hasDarkClass) return true;

        // Fallback to localStorage
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement; // <html>

        if (darkMode) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
        } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const [settings, setSettings] = useState({
        organizationName: "Village of Hope Orphanage",
        address: "123 Hope Street, Nairobi, Kenya",
        phone: "+254700123456",
        email: "admin@villageofhope.org",
        website: "www.villageofhope.org",
        timezone: "Africa/Nairobi",
        currency: "KES",
        language: "English",
    });

    const [notifState, setNotifState] = useState([
        { id: 1, type: "System Update", enabled: true, description: "System maintenance and updates" },
        { id: 2, type: "Health Alerts", enabled: true, description: "Health check-up reminders" },
        { id: 3, type: "Development Milestones", enabled: true, description: "Milestone progress notifications" },
        { id: 4, type: "Donation Alerts", enabled: false, description: "New donation notifications" },
        { id: 5, type: "User Activity", enabled: true, description: "User login and activity alerts" },
        { id: 6, type: "Data Backup", enabled: true, description: "Backup completion notifications" },
    ]);

    const handleSaveAll = () => {
        console.log("Save Settings:", { settings, notifState, darkMode });
        alert("Saved (demo). Connect this to your backend API.");
    };

    /* ---------------- Sections ---------------- */

    const GeneralSettings = () => (
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
                    value={settings.organizationName}
                    onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
                </div>

                <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                <Input value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} />
                </div>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                <Select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                </Select>
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <Select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                </Select>
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                <Select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                    <option value="English">English</option>
                    <option value="Swahili">Swahili</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                </Select>
                </div>
            </div>
            </CardContent>
        </Card>
        </div>
    );

    const SecuritySettings = () => (
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
                <Input type="number" defaultValue="8" />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password Expiry (days)
                </label>
                <Input type="number" defaultValue="90" />
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {[
                { label: "Require uppercase letters", checked: true },
                { label: "Require lowercase letters", checked: true },
                { label: "Require numbers", checked: true },
                { label: "Require special characters", checked: false },
                ].map((item) => (
                <label key={item.label} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded border-gray-300" />
                    {item.label}
                </label>
                ))}
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>
                <Shield className="h-5 w-5" />
                Session Management
            </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session Timeout (minutes)
                </label>
                <Input type="number" defaultValue="30" />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Concurrent Sessions
                </label>
                <Input type="number" defaultValue="3" />
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {[
                { label: "Force logout on password change", checked: true },
                { label: "Enable two-factor authentication", checked: true },
                ].map((item) => (
                <label key={item.label} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={item.checked} className="h-4 w-4 rounded border-gray-300" />
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
                <Input type="number" defaultValue="5" />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Lockout Duration (minutes)
                </label>
                <Input type="number" defaultValue="15" />
            </div>
            </CardContent>
        </Card>
        </div>
    );

    const NotificationSettings = () => (
        <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>
                <Bell className="h-5 w-5" />
                Notification Preferences
            </CardTitle>
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
                    onChange={(next) => setNotifState((prev) => prev.map((x) => (x.id === n.id ? { ...x, enabled: next } : x)))}
                />
                </div>
            ))}
            </div>
        </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>
                <Mail className="h-5 w-5" />
                Email Settings
            </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Server</label>
                <Input defaultValue="smtp.gmail.com" />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Port</label>
                <Input defaultValue="587" />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <Input defaultValue="admin@villageofhope.org" />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Input type="password" placeholder="••••••••" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Email Settings</Button>
            </div>
            </CardContent>
        </Card>
        </div>
    );

    const BackupSettings = () => (
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
                    {new Date(systemStats.lastBackup).toLocaleString()} — Status: {systemStats.backupStatus}
                </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Backup Frequency</label>
                <Select defaultValue="Daily (2:00 AM)">
                    <option>Daily (2:00 AM)</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                </Select>
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Retention Period</label>
                <Select defaultValue="30 days">
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                </Select>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button>
                <Download className="mr-2 h-4 w-4" />
                Create Backup
                </Button>
                <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Restore Backup
                </Button>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>
                <AlertCircle className="h-5 w-5" />
                System Maintenance
            </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900 dark:bg-yellow-950/30">
                <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Scheduled Maintenance</h4>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                System maintenance is scheduled for September 15, 2025 from 2:00 AM to 4:00 AM EAT. All users will be
                notified 24 hours in advance.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button variant="outline">View Maintenance Log</Button>
                <Button variant="outline">Schedule Maintenance</Button>
            </div>
            </CardContent>
        </Card>
        </div>
    );

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

            {/* Right top controls */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? "Dark" : "Default"}
                </span>

                <Toggle checked={darkMode} onChange={setDarkMode} />
                </div>

                <Button onClick={handleSaveAll} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
                </Button>
            </div>
            </div>

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
                    Backup &amp; Maintenance
                </Button>
                </div>
            </CardContent>
            </Card>

            {/* Section Content */}
            {activeSection === "general" && <GeneralSettings />}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "backup" && <BackupSettings />}
        </div>
        </div>
    );
    }
