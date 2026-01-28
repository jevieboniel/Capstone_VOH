import React, { useMemo, useState } from "react";
import {
    AlertTriangle,
    Plus,
    Send,
    Users,
    Calendar,
    Clock,
    Bell,
    Mail,
    MessageSquare,
    Target,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock3,
    RotateCcw,
    User,
    Check,
    X,
    Info,
    ChevronRight,
    LayoutGrid,
    Clipboard,
    } from "lucide-react";

    /* ---------------- Mock Data ---------------- */

    const mockAlerts = [
    {
        id: 1,
        title: "Health Check-up Reminder",
        message:
        "Health check-ups are due for Sarah M., John D., and Maria L. Please schedule appointments with Dr. Chen by September 12th. All children need their quarterly health assessments completed to maintain their health records up to date.",
        type: "health",
        priority: "high",
        recipients: ["All Staff", "House Parents"],
        sentDate: "2025-09-05",
        sentTime: "09:30",
        sentBy: "Dr. Michael Chen",
        status: "sent",
        readCount: 8,
        totalRecipients: 12,
        deliveryStatus: { delivered: 10, read: 8, failed: 2 },
        notificationMethods: ["email", "inApp"],
        readBy: [
        { name: "Sarah Johnson", role: "Staff", readAt: "2025-09-05 10:15" },
        { name: "Maria Santos", role: "House Parent", readAt: "2025-09-05 11:30" },
        { name: "John Wilson", role: "Staff", readAt: "2025-09-05 14:20" },
        { name: "Elena Rodriguez", role: "House Parent", readAt: "2025-09-05 15:45" },
        { name: "Michael Thompson", role: "Staff", readAt: "2025-09-06 08:15" },
        { name: "Lisa Chen", role: "House Parent", readAt: "2025-09-06 09:30" },
        { name: "David Martinez", role: "Staff", readAt: "2025-09-06 13:45" },
        { name: "Anna Kim", role: "House Parent", readAt: "2025-09-07 07:20" },
        ],
        unreadBy: [
        { name: "Robert Davis", role: "Staff", status: "delivered" },
        { name: "Patricia Wong", role: "House Parent", status: "delivered" },
        ],
        failedDelivery: [
        { name: "James Anderson", role: "Staff", reason: "Email bounced", method: "email" },
        { name: "Michelle Brown", role: "House Parent", reason: "Account inactive", method: "inApp" },
        ],
    },
    {
        id: 2,
        title: "School Enrollment Deadline",
        message:
        "School enrollment deadline is approaching for Alex P. and Emma R. Please complete registration by September 15th. All required documents must be submitted including birth certificates, previous school records, and medical clearances.",
        type: "education",
        priority: "medium",
        recipients: ["Education Staff", "House Parents"],
        sentDate: "2025-09-04",
        sentTime: "14:15",
        sentBy: "Sarah Johnson",
        status: "sent",
        readCount: 6,
        totalRecipients: 8,
        deliveryStatus: { delivered: 8, read: 6, failed: 0 },
        notificationMethods: ["email", "sms", "inApp"],
        readBy: [
        { name: "Linda Garcia", role: "Education Staff", readAt: "2025-09-04 15:30" },
        { name: "Thomas Lee", role: "House Parent", readAt: "2025-09-04 16:45" },
        { name: "Jennifer Miller", role: "Education Staff", readAt: "2025-09-05 08:20" },
        { name: "Carlos Hernandez", role: "House Parent", readAt: "2025-09-05 10:15" },
        { name: "Amanda Clark", role: "Education Staff", readAt: "2025-09-05 13:30" },
        { name: "Kevin Park", role: "House Parent", readAt: "2025-09-06 09:45" },
        ],
        unreadBy: [
        { name: "Sophie Turner", role: "Education Staff", status: "delivered" },
        { name: "Daniel Rivera", role: "House Parent", status: "delivered" },
        ],
        failedDelivery: [],
    },
    {
        id: 3,
        title: "Monthly Report Due",
        message:
        "Monthly development reports are due for all children by September 10th. Please ensure all sections are completed including physical development, educational progress, social skills, and behavioral observations.",
        type: "administrative",
        priority: "medium",
        recipients: ["All Staff"],
        sentDate: "2025-09-03",
        sentTime: "08:00",
        sentBy: "Admin System",
        status: "sent",
        readCount: 15,
        totalRecipients: 20,
        deliveryStatus: { delivered: 20, read: 15, failed: 0 },
        notificationMethods: ["email", "inApp"],
        readBy: [
        { name: "Sarah Johnson", role: "Staff", readAt: "2025-09-03 08:15" },
        { name: "Dr. Michael Chen", role: "Medical Staff", readAt: "2025-09-03 08:30" },
        { name: "Maria Santos", role: "House Parent", readAt: "2025-09-03 09:45" },
        { name: "Emily Rodriguez", role: "Social Worker", readAt: "2025-09-03 10:20" },
        { name: "John Wilson", role: "Staff", readAt: "2025-09-03 11:15" },
        ],
        unreadBy: [
        { name: "Alex Thompson", role: "Staff", status: "delivered" },
        { name: "Lisa Martinez", role: "House Parent", status: "delivered" },
        { name: "Peter Kim", role: "Staff", status: "delivered" },
        { name: "Rachel Davis", role: "House Parent", status: "delivered" },
        { name: "Mark Wilson", role: "Staff", status: "delivered" },
        ],
        failedDelivery: [],
    },
    {
        id: 4,
        title: "Emergency Contact Update",
        message:
        "Please update emergency contact information for Ana C. and Robert M. This is urgent as their current emergency contacts are no longer reachable. New forms are available in the office.",
        type: "urgent",
        priority: "high",
        recipients: ["Social Workers", "Admin"],
        sentDate: "2025-09-02",
        sentTime: "",
        sentBy: "Emily Rodriguez",
        status: "draft",
        readCount: 0,
        totalRecipients: 5,
        deliveryStatus: { delivered: 0, read: 0, failed: 0 },
        notificationMethods: ["email", "sms", "inApp"],
        readBy: [],
        unreadBy: [],
        failedDelivery: [],
    },
    ];

    const alertTypes = [
    { value: "health", label: "Health & Medical", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "administrative", label: "Administrative", icon: "📋" },
    { value: "urgent", label: "Urgent", icon: "🚨" },
    { value: "general", label: "General", icon: "📢" },
    { value: "maintenance", label: "Maintenance", icon: "🔧" },
    ];

    const recipientGroups = ["Staff", "House Parents", "Social Workers", "Administrator"];

    const priorityPill = {
    high: "bg-red-50 text-red-700 border-red-100",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
    low: "bg-blue-50 text-blue-700 border-blue-100",
    };

    const statusPill = {
    sent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-100",
    };

    /* Simple progress bar (dark like screenshot) */
    const ProgressBar = ({ value }) => (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-slate-900 transition-all" style={{ width: `${value}%` }} />
    </div>
    );

    /* -------- date/time helpers (AM/PM for list) -------- */
    const formatDateUS = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US");
    };

    const formatTime12 = (timeStr) => {
    if (!timeStr) return "";
    const [hh, mm] = timeStr.split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;
    const d = new Date(2000, 0, 1, hh, mm, 0);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const formatDateTime = (dateStr, timeStr) => {
    const d = formatDateUS(dateStr);
    const t = formatTime12(timeStr);
    return t ? `${d} at ${t}` : d;
    };

    const Alerts = () => {
    const userRole = "admin";

    const [alerts, setAlerts] = useState(mockAlerts);

    const [showCreateAlert, setShowCreateAlert] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");

    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showViewDetails, setShowViewDetails] = useState(false);

    const [sendingAlert, setSendingAlert] = useState(null);
    const [feedback, setFeedback] = useState("");

    const [newAlert, setNewAlert] = useState({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        recipients: [],
        scheduleDate: "",
        scheduleTime: "",
        notificationMethods: { email: true, sms: false, inApp: true },
    });

    const filteredAlerts = useMemo(() => {
        const toTimestamp = (a) => {
        const date = a.sentDate || "1970-01-01";
        const time = a.sentTime || "00:00";
        return new Date(`${date}T${time}:00`).getTime();
        };

        return alerts
        .filter((alert) => {
            const matchesSearch =
            alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "all" || alert.type === filterType;
            const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
            return matchesSearch && matchesType && matchesPriority;
        })
        .sort((a, b) => toTimestamp(b) - toTimestamp(a));
    }, [alerts, searchTerm, filterType, filterPriority]);

    const toggleRecipient = (group) => {
        setNewAlert((prev) => ({
        ...prev,
        recipients: prev.recipients.includes(group)
            ? prev.recipients.filter((r) => r !== group)
            : [...prev.recipients, group],
        }));
    };

    const toggleNotificationMethod = (method) => {
        setNewAlert((prev) => ({
        ...prev,
        notificationMethods: {
            ...prev.notificationMethods,
            [method]: !prev.notificationMethods[method],
        },
        }));
    };

    const handleCreateAlert = () => {
        if (!newAlert.title || !newAlert.message || newAlert.recipients.length === 0) {
        setFeedback("Please fill in title, message, and select at least one recipient group.");
        return;
        }

        const isScheduled = Boolean(newAlert.scheduleDate && newAlert.scheduleTime);

        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const currentTime = now.toTimeString().slice(0, 5);

        const methods = Object.entries(newAlert.notificationMethods)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

        const createdAlert = {
        id: Date.now(),
        title: newAlert.title,
        message: newAlert.message,
        type: newAlert.type,
        priority: newAlert.priority,
        recipients: newAlert.recipients,
        sentDate: isScheduled ? newAlert.scheduleDate : today,
        sentTime: isScheduled ? newAlert.scheduleTime : currentTime,
        sentBy: userRole === "admin" ? "Admin" : "Staff",
        status: isScheduled ? "scheduled" : "sent",
        readCount: 0,
        totalRecipients: newAlert.recipients.length,
        deliveryStatus: {
            delivered: isScheduled ? 0 : newAlert.recipients.length,
            read: 0,
            failed: 0,
        },
        notificationMethods: methods,
        readBy: [],
        unreadBy: [],
        failedDelivery: [],
        };

        setAlerts((prev) => [createdAlert, ...prev]);

        setFeedback(
        isScheduled
            ? `Alert scheduled for ${newAlert.scheduleDate} at ${formatTime12(newAlert.scheduleTime)} to ${newAlert.recipients.length} groups.`
            : `Alert "${newAlert.title}" sent to ${newAlert.recipients.length} recipient groups.`
        );

        setNewAlert({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        recipients: [],
        scheduleDate: "",
        scheduleTime: "",
        notificationMethods: { email: true, sms: false, inApp: true },
        });

        setShowCreateAlert(false);
    };

    const handleViewDetails = (alert) => {
        setSelectedAlert(alert);
        setShowViewDetails(true);
    };

    const handleSendDraftAlert = (alertId) => {
        setSendingAlert(alertId);
        setFeedback("");
        setTimeout(() => {
        setSendingAlert(null);
        setAlerts((prev) =>
            prev.map((a) =>
            a.id === alertId
                ? {
                    ...a,
                    status: "sent",
                    sentDate: a.sentDate || new Date().toISOString().slice(0, 10),
                    sentTime: a.sentTime || new Date().toTimeString().slice(0, 5),
                    deliveryStatus: {
                    ...a.deliveryStatus,
                    delivered: a.totalRecipients,
                    failed: 0,
                    },
                }
                : a
            )
        );
        setFeedback("Draft alert sent successfully to all recipients.");
        }, 1500);
    };

    const handleResendAlert = (alertId) => {
        setSendingAlert(alertId);
        setFeedback("");
        setTimeout(() => {
        setSendingAlert(null);
        setAlerts((prev) =>
            prev.map((a) =>
            a.id === alertId
                ? {
                    ...a,
                    deliveryStatus: { ...a.deliveryStatus, failed: 0 },
                    failedDelivery: [],
                }
                : a
            )
        );
        setFeedback("Alert resent to failed recipients.");
        }, 1500);
    };

    const getDeliveryRate = (alert) => {
        if (!alert.totalRecipients) return 0;
        return Math.round((alert.deliveryStatus.delivered / alert.totalRecipients) * 100);
    };

    const getReadRate = (alert) => {
        if (!alert.deliveryStatus.delivered) return 0;
        return Math.round((alert.deliveryStatus.read / alert.deliveryStatus.delivered) * 100);
    };

    const typeMeta = (type) => alertTypes.find((t) => t.value === type);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
            {/* Header (match Children module sizing) */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                {/* ✅ same sizing style as your Children page */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Alert Management
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                Send and manage system alerts and notifications
                </p>
            </div>

            {(userRole === "admin" || userRole === "staff") && (
                <button
                onClick={() => setShowCreateAlert(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 w-full sm:w-auto"
                >
                <Plus className="h-4 w-4" />
                Create Alert
                </button>

            )}
            </div>

            {/* Feedback */}
            {feedback && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle className="h-4 w-4" />
                <span>{feedback}</span>
                <button className="ml-auto text-xs underline" onClick={() => setFeedback("")}>
                Dismiss
                </button>
            </div>
            )}

            {/* Filters */}
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search alerts..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:w-[420px]">
                <select
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">All Types</option>
                    {alertTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                    </option>
                    ))}
                </select>

                <select
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                </select>
                </div>
            </div>
            </div>

            {/* Alerts list */}
            <div className="space-y-5">
            {filteredAlerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 gap-4">
                    <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>

                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityPill[alert.priority]}`}
                        >
                            {alert.priority}
                        </span>

                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusPill[alert.status]}`}
                        >
                            {alert.status}
                        </span>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {alert.message}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            {alert.recipients.join(", ")}
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {formatDateTime(alert.sentDate, alert.sentTime)}
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <Target className="h-4 w-4 text-slate-500" />
                            {alert.readCount}/{alert.totalRecipients} read
                        </span>
                        </div>
                    </div>
                    </div>

                    <div className="flex items-center gap-3 lg:justify-end">
                    <button
                        onClick={() => handleViewDetails(alert)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                        <Eye className="h-4 w-4 text-slate-700" />
                        View Details
                    </button>

                    {alert.status === "draft" && (userRole === "admin" || userRole === "staff") && (
                        <button
                        onClick={() => handleSendDraftAlert(alert.id)}
                        disabled={sendingAlert === alert.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                        >
                        {sendingAlert === alert.id ? (
                            <Clock3 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Send
                        </button>
                    )}

                    {alert.status === "sent" &&
                        alert.deliveryStatus?.failed > 0 &&
                        (userRole === "admin" || userRole === "staff") && (
                        <button
                            onClick={() => handleResendAlert(alert.id)}
                            disabled={sendingAlert === alert.id}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                            {sendingAlert === alert.id ? (
                            <Clock3 className="h-4 w-4 animate-spin" />
                            ) : (
                            <RotateCcw className="h-4 w-4 text-slate-700" />
                            )}
                            Resend
                        </button>
                        )}
                    </div>
                </div>
                </div>
            ))}

            {filteredAlerts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                No alerts match your current search and filters.
                </div>
            )}
            </div>

            {/* ---------------- Create Alert Modal (unchanged) ---------------- */}
            {showCreateAlert && (
            <div
                className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
                onClick={() => setShowCreateAlert(false)}
            >
                <div
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Create New Alert</h2>
                    </div>
                    <button
                    onClick={() => setShowCreateAlert(false)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                    >
                    <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mb-4 text-xs text-slate-500">
                    Notify staff and house parents about important updates.
                </p>

                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                        Alert Title *
                        </label>
                        <input
                        type="text"
                        value={newAlert.title}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        placeholder="Enter alert title"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                        Alert Type
                        </label>
                        <select
                        value={newAlert.type}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        >
                        {alertTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Message *
                    </label>
                    <textarea
                        rows={4}
                        value={newAlert.message}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        placeholder="Enter the alert message..."
                    />
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Priority Level
                    </label>
                    <select
                        value={newAlert.priority}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, priority: e.target.value }))}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                    >
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                    </select>
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Recipients * (select at least one)
                    </label>
                    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
                        {recipientGroups.map((group) => (
                        <label
                            key={group}
                            className="flex cursor-pointer items-center gap-2 text-xs text-slate-700"
                        >
                            <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.recipients.includes(group)}
                            onChange={() => toggleRecipient(group)}
                            />
                            {group}
                        </label>
                        ))}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Selected: {newAlert.recipients.length} groups
                    </p>
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Notification Methods
                    </label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                        <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.email}
                            onChange={() => toggleNotificationMethod("email")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                        </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                        <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.sms}
                            onChange={() => toggleNotificationMethod("sms")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            SMS
                        </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                        <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.inApp}
                            onChange={() => toggleNotificationMethod("inApp")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <Bell className="h-3.5 w-3.5" />
                            In-App
                        </span>
                        </label>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                        Schedule Date (optional)
                        </label>
                        <input
                        type="date"
                        value={newAlert.scheduleDate}
                        onChange={(e) =>
                            setNewAlert((prev) => ({ ...prev, scheduleDate: e.target.value }))
                        }
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                        Schedule Time (optional)
                        </label>
                        <input
                        type="time"
                        value={newAlert.scheduleTime}
                        onChange={(e) =>
                            setNewAlert((prev) => ({ ...prev, scheduleTime: e.target.value }))
                        }
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
                    <strong>Preview:</strong> Your alert will be sent to {newAlert.recipients.length}{" "}
                    group{newAlert.recipients.length === 1 ? "" : "s"}
                    {newAlert.scheduleDate ? ` on ${newAlert.scheduleDate}` : " immediately"}
                    {newAlert.scheduleTime ? ` at ${formatTime12(newAlert.scheduleTime)}` : ""}.
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                    onClick={() => setShowCreateAlert(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleCreateAlert}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                    <Send className="h-4 w-4" />
                    {newAlert.scheduleDate ? "Schedule Alert" : "Send Alert"}
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* ---------------- View Details Modal (unchanged) ---------------- */}
            {showViewDetails && selectedAlert && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                onClick={() => setShowViewDetails(false)}
            >
                <div
                className="w-full max-w-5xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div>
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-semibold text-slate-900">Alert Details</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Comprehensive information and delivery status for this alert.
                    </p>
                    </div>

                    <button
                    onClick={() => setShowViewDetails(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                    >
                    <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedAlert.title}</h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${priorityPill[selectedAlert.priority]}`}
                    >
                        {selectedAlert.priority} priority
                    </span>

                    <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusPill[selectedAlert.status]}`}
                    >
                        {selectedAlert.status}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800">
                        <span className="text-base">{typeMeta(selectedAlert.type)?.icon}</span>
                        {typeMeta(selectedAlert.type)?.label}
                    </span>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-6">
                    <h4 className="text-lg font-semibold text-slate-900">Message</h4>
                    <p className="mt-3 text-base leading-relaxed text-slate-700">
                        {selectedAlert.message}
                    </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-6">
                        <div>
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <User className="h-4 w-4 text-slate-600" />
                            Sent By
                        </div>
                        <p className="mt-2 text-slate-700">{selectedAlert.sentBy}</p>
                        </div>

                        <div>
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <Users className="h-4 w-4 text-slate-600" />
                            Recipients
                        </div>
                        <p className="mt-2 text-slate-700">{selectedAlert.recipients.join(", ")}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            Date &amp; Time
                        </div>
                        <p className="mt-2 text-slate-700">
                            {formatDateTime(selectedAlert.sentDate, selectedAlert.sentTime)}
                        </p>
                        </div>

                        <div>
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <Clipboard className="h-4 w-4 text-slate-600" />
                            Methods
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedAlert.notificationMethods.map((m) => (
                            <span
                                key={m}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
                            >
                                {m === "email" && <Mail className="h-4 w-4 text-slate-600" />}
                                {m === "sms" && <MessageSquare className="h-4 w-4 text-slate-600" />}
                                {m === "inApp" && <Bell className="h-4 w-4 text-slate-600" />}
                                {m}
                            </span>
                            ))}
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="my-8 border-t border-slate-200" />

                    {selectedAlert.status === "sent" && (
                    <>
                        <h4 className="text-lg font-bold text-slate-900">Delivery Statistics</h4>

                        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                            <p className="text-4xl font-extrabold text-blue-600">
                            {selectedAlert.deliveryStatus.delivered}
                            </p>
                            <p className="mt-1 text-slate-600">Delivered</p>
                            <div className="mt-4">
                            <ProgressBar value={getDeliveryRate(selectedAlert)} />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                            {getDeliveryRate(selectedAlert)}% delivery rate
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                            <p className="text-4xl font-extrabold text-emerald-600">
                            {selectedAlert.deliveryStatus.read}
                            </p>
                            <p className="mt-1 text-slate-600">Read</p>
                            <div className="mt-4">
                            <ProgressBar value={getReadRate(selectedAlert)} />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                            {getReadRate(selectedAlert)}% read rate
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                            <p className="text-4xl font-extrabold text-red-600">
                            {selectedAlert.deliveryStatus.failed}
                            </p>
                            <p className="mt-1 text-slate-600">Failed</p>
                            {selectedAlert.deliveryStatus.failed > 0 && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                                Delivery issues detected
                            </p>
                            )}
                        </div>
                        </div>
                    </>
                    )}

                    <div className="mt-10 flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                        onClick={() => setShowViewDetails(false)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                        Close
                    </button>

                    {selectedAlert.status === "sent" &&
                        selectedAlert.deliveryStatus.failed > 0 &&
                        (userRole === "admin" || userRole === "staff") && (
                        <button
                            onClick={() => handleResendAlert(selectedAlert.id)}
                            disabled={sendingAlert === selectedAlert.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-400"
                        >
                            {sendingAlert === selectedAlert.id ? (
                            <Clock3 className="h-4 w-4 animate-spin" />
                            ) : (
                            <RotateCcw className="h-4 w-4" />
                            )}
                            Resend
                        </button>
                        )}
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
};

export default Alerts;
