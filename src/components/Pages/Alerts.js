    import React, { useEffect, useMemo, useState } from "react";
    import {
    AlertTriangle,
    Plus,
    Users,
    Calendar,
    Search,
    Eye,
    CheckCircle,
    Clock3,
    RotateCcw,
    Target,
    } from "lucide-react";

    import Button from "../UI/Button";
    import CreateAlertModal from "../Modals/CreateAlertModal";
    import AlertViewDetailsModal from "../Modals/AlertViewDetailsModal";
    import { useAuth } from "../../contexts/AuthContext";

    /* ---------------- Alert Types / Roles ---------------- */
    const alertTypes = [
    { value: "health", label: "Health & Medical", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "administrative", label: "Administrative", icon: "📋" },
    { value: "urgent", label: "Urgent", icon: "🚨" },
    { value: "general", label: "General", icon: "📢" },
    { value: "maintenance", label: "Maintenance", icon: "🔧" },
    ];

    // IMPORTANT: must match your DB roles in users table
    const recipientGroups = ["Staff", "House Parent", "Social Worker", "Admin"];

    /* ---------------- UI helpers ---------------- */
    const Card = ({ className = "", children }) => (
    <div
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
        {children}
    </div>
    );

    const CardBody = ({ className = "", children }) => (
    <div className={`p-5 sm:p-6 ${className}`}>{children}</div>
    );

    const Input = ({ className = "", ...props }) => (
    <input
        className={`h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 ${className}`}
        {...props}
    />
    );

    const Select = ({ className = "", ...props }) => (
    <select
        className={`h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 ${className}`}
        {...props}
    />
    );

    const Pill = ({ className = "", children }) => (
    <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
        {children}
    </span>
    );

    /* Simple progress bar */
    const ProgressBar = ({ value }) => (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
        className="h-full bg-blue-600 transition-all rounded-full"
        style={{ width: `${value}%` }}
        />
    </div>
    );

    /* ---------------- Pills ---------------- */
    const priorityPill = {
    high: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20",
    medium:
        "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20",
    low: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    };

    const statusPill = {
    sent: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20",
    draft:
        "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
    scheduled:
        "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    failed:
        "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20",
    };

    /* -------- date/time helpers -------- */
    const formatDateUS = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US");
    };

    const formatTime12 = (timeStr) => {
    if (!timeStr) return "";
    const [hh, mm] = String(timeStr).split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;
    const d = new Date(2000, 0, 1, hh, mm, 0);
    return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    };

    // supports (dateStr,timeStr) AND ISO string
    const formatDateTime = (dateStr, timeStr) => {
    // if dateStr is ISO
    if (dateStr && typeof dateStr === "string" && dateStr.includes("T") && !timeStr) {
        const d = new Date(dateStr);
        if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
        }
    }

    const d = formatDateUS(dateStr);
    const t = formatTime12(timeStr);
    return t ? `${d} at ${t}` : d;
    };

    export default function Alerts() {
    const { user, authFetch } = useAuth();
    const userRole = (user?.role || "admin").toLowerCase();

    const [alerts, setAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(false);

    const [showCreateAlert, setShowCreateAlert] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");

    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showViewDetails, setShowViewDetails] = useState(false);

    const [sendingAlert, setSendingAlert] = useState(null);
    const [feedback, setFeedback] = useState("");

    // ✅ Email-only newAlert state (NO SMS)
    const [newAlert, setNewAlert] = useState({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        recipients: [],
        scheduleDate: "",
        scheduleTime: "",
    });

    /* =========================
        BACKEND: LOAD ALERTS
    ========================= */
    const normalizeAlertRow = (row) => {
        // row from backend might be:
        // { id,title,message,type,priority,status,recipient_roles,created_by,sent_at,scheduled_at,delivered,failed,total_recipients,created_at }
        let roles = [];
        try {
        roles = row.recipient_roles
            ? typeof row.recipient_roles === "string"
            ? JSON.parse(row.recipient_roles)
            : row.recipient_roles
            : [];
        } catch {
        roles = [];
        }

        // Create "sentDate/sentTime" fallback so old UI can still use
        const baseDate = row.sent_at || row.scheduled_at || row.created_at || null;
        let sentDate = "";
        let sentTime = "";
        if (baseDate) {
        const d = new Date(baseDate);
        if (!Number.isNaN(d.getTime())) {
            sentDate = d.toISOString().slice(0, 10);
            sentTime = d.toTimeString().slice(0, 5);
        }
        }

        const totalRecipients =
        Number(row.total_recipients ?? row.totalRecipients ?? 0) || 0;

        const delivered = Number(row.delivered ?? 0) || 0;
        const failed = Number(row.failed ?? 0) || 0;

        return {
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        priority: row.priority,
        recipients: roles, // roles list
        sentDate,
        sentTime,
        sentBy: row.created_by || "Admin",
        status: row.status || "sent",
        readCount: 0, // email-only; unless you implement tracking
        totalRecipients,
        deliveryStatus: { delivered, read: 0, failed },
        notificationMethods: ["email"], // forced email only
        // backend details will be fetched on view:
        recipientsList: row.recipientsList || [],
        };
    };

    const fetchAlerts = async () => {
        try {
        setLoadingAlerts(true);
        const res = await authFetch("/alerts"); // => /api/alerts
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load alerts.");

        const rows = Array.isArray(data) ? data : data.alerts || [];
        setAlerts(rows.map(normalizeAlertRow));
        } catch (e) {
        console.error(e);
        setFeedback(e.message || "Failed to load alerts.");
        } finally {
        setLoadingAlerts(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* =========================
        FILTERING + SORT
    ========================= */
    const filteredAlerts = useMemo(() => {
        const toTimestamp = (a) => {
        const date = a.sentDate || "1970-01-01";
        const time = a.sentTime || "00:00";
        return new Date(`${date}T${time}:00`).getTime();
        };

        return alerts
        .filter((alert) => {
            const matchesSearch =
            (alert.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (alert.message || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = filterType === "all" || alert.type === filterType;
            const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;

            return matchesSearch && matchesType && matchesPriority;
        })
        .sort((a, b) => toTimestamp(b) - toTimestamp(a));
    }, [alerts, searchTerm, filterType, filterPriority]);

    /* =========================
        UI HANDLERS
    ========================= */
    const toggleRecipient = (group) => {
        setNewAlert((prev) => ({
        ...prev,
        recipients: prev.recipients.includes(group)
            ? prev.recipients.filter((r) => r !== group)
            : [...prev.recipients, group],
        }));
    };

    /* =========================
        CREATE / SEND ALERT (BACKEND)
    ========================= */
    const handleCreateAlert = async () => {
        if (!newAlert.title || !newAlert.message || newAlert.recipients.length === 0) {
        setFeedback("Please fill in title, message, and select at least one recipient role.");
        return;
        }

        const isScheduled = Boolean(newAlert.scheduleDate && newAlert.scheduleTime);

        try {
        setSendingAlert("create");
        setFeedback("");

        const payload = {
            title: newAlert.title,
            message: newAlert.message,
            type: newAlert.type,
            priority: newAlert.priority,
            recipient_roles: newAlert.recipients, // roles array
            scheduled_at: isScheduled ? `${newAlert.scheduleDate}T${newAlert.scheduleTime}:00` : null,
        };

        const res = await authFetch("/alerts", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to send alert.");

        setFeedback(
            isScheduled
            ? `Alert scheduled for ${newAlert.scheduleDate} at ${formatTime12(newAlert.scheduleTime)}.`
            : `Alert "${newAlert.title}" sent successfully via Email.`
        );

        // reset
        setNewAlert({
            title: "",
            message: "",
            type: "general",
            priority: "medium",
            recipients: [],
            scheduleDate: "",
            scheduleTime: "",
        });

        setShowCreateAlert(false);
        await fetchAlerts();
        } catch (e) {
        console.error(e);
        setFeedback(e.message || "Failed to send alert.");
        } finally {
        setSendingAlert(null);
        }
    };

    /* =========================
        VIEW DETAILS (fetch /alerts/:id)
    ========================= */
    const handleViewDetails = async (alert) => {
        try {
        setSelectedAlert(alert);
        setShowViewDetails(true);

        // fetch full details (recipientsList etc.)
        const res = await authFetch(`/alerts/${alert.id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to load alert details.");

        const full = data.alert || data;
        const normalized = normalizeAlertRow(full);

        // if backend returns recipientsList in full alert
        normalized.recipientsList = Array.isArray(full.recipientsList) ? full.recipientsList : [];

        setSelectedAlert(normalized);
        } catch (e) {
        console.error(e);
        setFeedback(e.message || "Failed to load details.");
        }
    };

    /* =========================
        RESEND FAILED (BACKEND)
    ========================= */
    const handleResendAlert = async (alertId) => {
        try {
        setSendingAlert(alertId);
        setFeedback("");

        const res = await authFetch(`/alerts/${alertId}/resend-failed`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to resend.");

        setFeedback("Alert resent to failed recipients.");
        await fetchAlerts();

        // refresh selected alert details if modal open
        if (selectedAlert?.id === alertId) {
            const res2 = await authFetch(`/alerts/${alertId}`);
            const data2 = await res2.json().catch(() => ({}));
            if (res2.ok) {
            const full = data2.alert || data2;
            const normalized = normalizeAlertRow(full);
            normalized.recipientsList = Array.isArray(full.recipientsList) ? full.recipientsList : [];
            setSelectedAlert(normalized);
            }
        }
        } catch (e) {
        console.error(e);
        setFeedback(e.message || "Failed to resend.");
        } finally {
        setSendingAlert(null);
        }
    };

    const getReadRate = (alert) =>
        !alert?.deliveryStatus?.delivered
        ? 0
        : Math.round((alert.deliveryStatus.read / alert.deliveryStatus.delivered) * 100);

    const typeMeta = (type) => alertTypes.find((t) => t.value === type);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Alert Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Send and manage system alerts and notifications
                </p>
            </div>

            {(userRole === "admin" || userRole === "staff") && (
                <Button
                variant="primary"
                size="medium"
                onClick={() => setShowCreateAlert(true)}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                disabled={sendingAlert === "create"}
                >
                <Plus className="h-4 w-4" />
                Create Alert
                </Button>
            )}
            </div>

            {/* Feedback */}
            {feedback && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 shadow-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">{feedback}</span>
                <button
                className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/10"
                onClick={() => setFeedback("")}
                type="button"
                >
                Dismiss
                </button>
            </div>
            )}

            {/* Filters */}
            <Card>
            <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:w-[420px]">
                    <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="all">All Types</option>
                    {alertTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                        </option>
                    ))}
                    </Select>

                    <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                    </Select>
                </div>
                </div>
            </CardBody>
            </Card>

            {/* Loading */}
            {loadingAlerts && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-300">
                Loading alerts...
            </div>
            )}

            {/* Alerts list */}
            <div className="space-y-4">
            {filteredAlerts.map((alert) => (
                <Card key={alert.id}>
                <CardBody>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 gap-4 min-w-0">
                        <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 ring-1 ring-red-100 dark:ring-red-500/20">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
                        </div>

                        <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {alert.title}
                            </h3>

                            <Pill className={priorityPill[alert.priority]}>{alert.priority}</Pill>
                            <Pill className={statusPill[alert.status] || statusPill.sent}>{alert.status}</Pill>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                            {alert.message}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {alert.recipients?.length ? alert.recipients.join(", ") : "—"}
                            </span>

                            <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {formatDateTime(alert.sentDate, alert.sentTime)}
                            </span>

                            <span className="inline-flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {alert.deliveryStatus?.delivered || 0}/{alert.totalRecipients || 0} delivered
                            </span>
                        </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:justify-end">
                        <Button
                        variant="outline"
                        size="medium"
                        onClick={() => handleViewDetails(alert)}
                        className="inline-flex items-center gap-2"
                        >
                        <Eye className="h-4 w-4" />
                        View Details
                        </Button>

                        {alert.status === "sent" &&
                        alert.deliveryStatus?.failed > 0 &&
                        (userRole === "admin" || userRole === "staff") && (
                            <Button
                            variant="outline"
                            size="medium"
                            onClick={() => handleResendAlert(alert.id)}
                            disabled={sendingAlert === alert.id}
                            className="inline-flex items-center gap-2"
                            >
                            {sendingAlert === alert.id ? (
                                <Clock3 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="h-4 w-4" />
                            )}
                            Resend
                            </Button>
                        )}
                    </div>
                    </div>
                </CardBody>
                </Card>
            ))}

            {!loadingAlerts && filteredAlerts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-gray-600 dark:text-gray-400 shadow-sm">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                No alerts match your current search and filters.
                </div>
            )}
            </div>

            {/* ---------------- Create Alert Modal ---------------- */}
            <CreateAlertModal
            showCreateAlert={showCreateAlert}
            setShowCreateAlert={setShowCreateAlert}
            newAlert={newAlert}
            setNewAlert={setNewAlert}
            alertTypes={alertTypes}
            recipientGroups={recipientGroups}
            toggleRecipient={toggleRecipient}
            formatTime12={formatTime12}
            handleCreateAlert={handleCreateAlert}
            Input={Input}
            Select={Select}
            />

            {/* ---------------- View Details Modal ---------------- */}
            <AlertViewDetailsModal
            showViewDetails={showViewDetails}
            setShowViewDetails={setShowViewDetails}
            selectedAlert={selectedAlert}
            priorityPill={priorityPill}
            statusPill={statusPill}
            typeMeta={typeMeta}
            formatDateTime={formatDateTime}
            getReadRate={getReadRate}
            Card={Card}
            CardBody={CardBody}
            Pill={Pill}
            ProgressBar={ProgressBar}
            userRole={userRole}
            sendingAlert={sendingAlert}
            handleResendAlert={handleResendAlert}
            />
        </div>
        </div>
    );
    }
