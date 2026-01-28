    import React, { useMemo, useState } from "react";
    import {
    AlertTriangle,
    Plus,
    Send,
    Users,
    Calendar,
    Search,
    Eye,
    CheckCircle,
    Clock3,
    RotateCcw,
    User,
    X,
    Info,
    Clipboard,
    Mail,
    MessageSquare,
    Bell,
    Target,
    } from "lucide-react";

    // ✅ If you have your shared button, use it (recommended)
    import Button from "../UI/Button";

    /* ---------------- Mock Data ---------------- */

    const mockAlerts = [
    {
        id: 1,
        title: "Health Check-up Reminder",
        message:
        "Health check-ups are due for Sarah M., John D., and Maria L. Please schedule appointments with Dr. Chen by September 12th.",
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
        readBy: [],
        unreadBy: [],
        failedDelivery: [],
    },
    // add the rest of your alerts here...
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


    const Card = ({ className = "", children }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>{children}</div>
    );

    const CardBody = ({ className = "", children }) => (
    <div className={`p-5 ${className}`}>{children}</div>
    );

    const Input = ({ className = "", ...props }) => (
    <input
        className={`h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
        {...props}
    />
    );

    const Select = ({ className = "", ...props }) => (
    <select
        className={`h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
        {...props}
    />
    );

    const Pill = ({ className = "", children }) => (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
        {children}
    </span>
    );

    /* Simple progress bar */
    const ProgressBar = ({ value }) => (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-gray-900 transition-all" style={{ width: `${value}%` }} />
    </div>
    );

    /* ---------------- Your existing pills, keep but swap slate -> gray where needed ---------------- */

    const priorityPill = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-yellow-50 text-yellow-800 border-yellow-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const statusPill = {
    sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    };

    /* -------- date/time helpers (keep yours) -------- */
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

    export default function Alerts() {
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
                    deliveryStatus: { ...a.deliveryStatus, delivered: a.totalRecipients, failed: 0 },
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
            a.id === alertId ? { ...a, deliveryStatus: { ...a.deliveryStatus, failed: 0 }, failedDelivery: [] } : a
            )
        );
        setFeedback("Alert resent to failed recipients.");
        }, 1500);
    };

    const getReadRate = (alert) => (!alert.deliveryStatus.delivered ? 0 : Math.round((alert.deliveryStatus.read / alert.deliveryStatus.delivered) * 100));

    const typeMeta = (type) => alertTypes.find((t) => t.value === type);

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alert Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Send and manage system alerts and notifications</p>
            </div>

            {(userRole === "admin" || userRole === "staff") && (
                <Button
                variant="primary"
                size="medium"
                onClick={() => setShowCreateAlert(true)}
                className="inline-flex items-center gap-2 w-full sm:w-auto"
                >
                <Plus className="h-4 w-4" />
                Create Alert
                </Button>
            )}
            </div>

            {/* Feedback */}
            {feedback && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle className="h-4 w-4" />
                <span>{feedback}</span>
                <button className="ml-auto text-xs underline" onClick={() => setFeedback("")}>
                Dismiss
                </button>
            </div>
            )}

            {/* Filters */}
            <Card>
            <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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

            {/* Alerts list */}
            <div className="space-y-4">
            {filteredAlerts.map((alert) => (
                <Card key={alert.id}>
                <CardBody>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 gap-4">
                        <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>

                            <Pill className={priorityPill[alert.priority]}>{alert.priority}</Pill>
                            <Pill className={statusPill[alert.status]}>{alert.status}</Pill>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-gray-700">{alert.message}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {alert.recipients.join(", ")}
                            </span>

                            <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {formatDateTime(alert.sentDate, alert.sentTime)}
                            </span>

                            <span className="inline-flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            {alert.readCount}/{alert.totalRecipients} read
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

                        {alert.status === "draft" && (userRole === "admin" || userRole === "staff") && (
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={() => handleSendDraftAlert(alert.id)}
                            disabled={sendingAlert === alert.id}
                            className="inline-flex items-center gap-2"
                        >
                            {sendingAlert === alert.id ? <Clock3 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send
                        </Button>
                        )}

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

            {filteredAlerts.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                No alerts match your current search and filters.
                </div>
            )}
            </div>

            {/* ---------------- Create Alert Modal (aligned UI) ---------------- */}
            {showCreateAlert && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreateAlert(false)}>
                <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Create New Alert</h2>
                    </div>
                    <button onClick={() => setShowCreateAlert(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mb-4 text-xs text-gray-600">Notify staff and house parents about important updates.</p>

                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Alert Title *</label>
                        <Input
                        value={newAlert.title}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter alert title"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Alert Type</label>
                        <Select value={newAlert.type} onChange={(e) => setNewAlert((prev) => ({ ...prev, type: e.target.value }))}>
                        {alertTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                            </option>
                        ))}
                        </Select>
                    </div>
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Message *</label>
                    <textarea
                        rows={4}
                        value={newAlert.message}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter the alert message..."
                    />
                    </div>

                    <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Priority Level</label>
                    <Select value={newAlert.priority} onChange={(e) => setNewAlert((prev) => ({ ...prev, priority: e.target.value }))}>
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                    </Select>
                    </div>

                    <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">Recipients * (select at least one)</label>
                    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                        {recipientGroups.map((group) => (
                        <label key={group} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                            <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.recipients.includes(group)}
                            onChange={() => toggleRecipient(group)}
                            />
                            {group}
                        </label>
                        ))}
                    </div>
                    <p className="mt-1 text-[11px] text-gray-600">Selected: {newAlert.recipients.length} groups</p>
                    </div>

                    <div>
                    <label className="mb-2 block text-xs font-medium text-gray-700">Notification Methods</label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.email}
                            onChange={() => toggleNotificationMethod("email")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Email
                        </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.sms}
                            onChange={() => toggleNotificationMethod("sms")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            SMS
                        </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={newAlert.notificationMethods.inApp}
                            onChange={() => toggleNotificationMethod("inApp")}
                        />
                        <span className="inline-flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            In-App
                        </span>
                        </label>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Schedule Date (optional)</label>
                        <Input
                        type="date"
                        value={newAlert.scheduleDate}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Schedule Time (optional)</label>
                        <Input
                        type="time"
                        value={newAlert.scheduleTime}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                        />
                    </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-800 border border-blue-100">
                    <strong>Preview:</strong> Your alert will be sent to {newAlert.recipients.length} group
                    {newAlert.recipients.length === 1 ? "" : "s"}
                    {newAlert.scheduleDate ? ` on ${newAlert.scheduleDate}` : " immediately"}
                    {newAlert.scheduleTime ? ` at ${formatTime12(newAlert.scheduleTime)}` : ""}.
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" size="medium" onClick={() => setShowCreateAlert(false)}>
                    Cancel
                    </Button>

                    <Button variant="primary" size="medium" onClick={handleCreateAlert} className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {newAlert.scheduleDate ? "Schedule Alert" : "Send Alert"}
                    </Button>
                </div>
                </div>
            </div>
            )}

            {/* ---------------- View Details Modal (if you want aligned too) ---------------- */}
            {showViewDetails && selectedAlert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowViewDetails(false)}>
                <div className="w-full max-w-5xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
                    <div>
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-900">Alert Details</h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Comprehensive information and delivery status for this alert.</p>
                    </div>

                    <button onClick={() => setShowViewDetails(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedAlert.title}</h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill className={priorityPill[selectedAlert.priority]}>{selectedAlert.priority} priority</Pill>
                    <Pill className={statusPill[selectedAlert.status]}>{selectedAlert.status}</Pill>

                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-800">
                        <span className="text-base">{typeMeta(selectedAlert.type)?.icon}</span>
                        {typeMeta(selectedAlert.type)?.label}
                    </span>
                    </div>

                    <div className="mt-6 rounded-xl bg-gray-50 p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Message</h4>
                    <p className="mt-3 text-base leading-relaxed text-gray-700">{selectedAlert.message}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-5">
                        <div>
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <User className="h-4 w-4 text-gray-600" />
                            Sent By
                        </div>
                        <p className="mt-2 text-gray-700">{selectedAlert.sentBy}</p>
                        </div>

                        <div>
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <Users className="h-4 w-4 text-gray-600" />
                            Recipients
                        </div>
                        <p className="mt-2 text-gray-700">{selectedAlert.recipients.join(", ")}</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            Date &amp; Time
                        </div>
                        <p className="mt-2 text-gray-700">{formatDateTime(selectedAlert.sentDate, selectedAlert.sentTime)}</p>
                        </div>

                        <div>
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <Clipboard className="h-4 w-4 text-gray-600" />
                            Methods
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedAlert.notificationMethods.map((m) => (
                            <span key={m} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                                {m === "email" && <Mail className="h-4 w-4 text-gray-600" />}
                                {m === "sms" && <MessageSquare className="h-4 w-4 text-gray-600" />}
                                {m === "inApp" && <Bell className="h-4 w-4 text-gray-600" />}
                                {m}
                            </span>
                            ))}
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="my-8 border-t border-gray-200" />

                    {selectedAlert.status === "sent" && (
                    <>
                        <h4 className="text-lg font-bold text-gray-900">Delivery Statistics</h4>

                        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                        <Card>
                            <CardBody className="text-center">
                            <p className="text-4xl font-extrabold text-blue-600">{selectedAlert.deliveryStatus.delivered}</p>
                            <p className="mt-1 text-gray-600">Delivered</p>
                            <div className="mt-4">
                                <ProgressBar value={Math.round((selectedAlert.deliveryStatus.delivered / selectedAlert.totalRecipients) * 100)} />
                            </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center">
                            <p className="text-4xl font-extrabold text-emerald-600">{selectedAlert.deliveryStatus.read}</p>
                            <p className="mt-1 text-gray-600">Read</p>
                            <div className="mt-4">
                                <ProgressBar value={getReadRate(selectedAlert)} />
                            </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center">
                            <p className="text-4xl font-extrabold text-red-600">{selectedAlert.deliveryStatus.failed}</p>
                            <p className="mt-1 text-gray-600">Failed</p>
                            {selectedAlert.deliveryStatus.failed > 0 && (
                                <p className="mt-3 text-sm font-medium text-red-600">Delivery issues detected</p>
                            )}
                            </CardBody>
                        </Card>
                        </div>
                    </>
                    )}

                    <div className="mt-8 flex justify-end gap-2 border-t border-gray-100 pt-5">
                    <Button variant="outline" size="medium" onClick={() => setShowViewDetails(false)}>
                        Close
                    </Button>

                    {selectedAlert.status === "sent" &&
                        selectedAlert.deliveryStatus.failed > 0 &&
                        (userRole === "admin" || userRole === "staff") && (
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={() => handleResendAlert(selectedAlert.id)}
                            disabled={sendingAlert === selectedAlert.id}
                            className="inline-flex items-center gap-2"
                        >
                            {sendingAlert === selectedAlert.id ? <Clock3 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                            Resend
                        </Button>
                        )}
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
    }
