    import React, { useMemo } from "react";
    import {
    Info,
    X,
    Mail,
    User,
    Users,
    Calendar,
    Clipboard,
    Clock3,
    RotateCcw,
    AlertCircle,
    } from "lucide-react";
    import Button from "../UI/Button";

    export default function AlertViewDetailsModal({
    showViewDetails,
    setShowViewDetails,
    selectedAlert,
    priorityPill,
    statusPill,
    typeMeta,
    formatDateTime,
    getReadRate,
    Card,
    CardBody,
    Pill,
    ProgressBar,
    userRole,
    sendingAlert,
    handleResendAlert,
    }) {
    // ✅ Hook must be called unconditionally (before any return)
    const normalized = useMemo(() => {
        const a = selectedAlert || {};

        // recipients roles: backend uses recipient_roles JSON, old uses recipients array
        let roles = [];
        if (Array.isArray(a.recipients)) roles = a.recipients;
        else if (a.recipient_roles) {
        try {
            roles =
            typeof a.recipient_roles === "string"
                ? JSON.parse(a.recipient_roles)
                : a.recipient_roles;
        } catch {
            roles = [];
        }
        }

        // status
        const status = a.status || "sent";

        // date/time: backend uses sent_at/scheduled_at/created_at; old uses sentDate/sentTime
        const dateTimeText =
        a.sent_at || a.scheduled_at || a.created_at
            ? typeof formatDateTime === "function"
            ? a.sent_at
                ? formatDateTime(a.sent_at)
                : a.scheduled_at
                ? formatDateTime(a.scheduled_at)
                : formatDateTime(a.created_at)
            : String(a.sent_at || a.scheduled_at || a.created_at)
            : typeof formatDateTime === "function"
            ? formatDateTime(a.sentDate, a.sentTime)
            : `${a.sentDate || "—"} ${a.sentTime || ""}`;

        // delivery stats:
        const totalRecipients = Number(
        a.totalRecipients ??
            a.total_recipients ??
            (Array.isArray(a.recipientsList) ? a.recipientsList.length : 0) ??
            0
        );

        const delivered = Number(a.delivered ?? a.deliveryStatus?.delivered ?? 0);
        const failed = Number(a.failed ?? a.deliveryStatus?.failed ?? 0);

        // optional read (only if your old mock has it)
        const read = Number(a.deliveryStatus?.read ?? 0);

        // recipientsList for failed details (backend)
        const recipientsList = Array.isArray(a.recipientsList) ? a.recipientsList : [];

        return {
        ...a,
        roles,
        status,
        dateTimeText,
        totalRecipients,
        delivered,
        failed,
        read,
        recipientsList,
        };
    }, [selectedAlert, formatDateTime]);

    // ✅ NOW we can safely return null
    if (!showViewDetails || !selectedAlert) return null;

    const meta = typeMeta?.(normalized.type);

    const deliveredPercent =
        normalized.totalRecipients > 0
        ? Math.round((normalized.delivered / normalized.totalRecipients) * 100)
        : 0;

    const failedList = normalized.recipientsList.filter(
        (r) => r.delivery_status === "failed"
    );

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={() => setShowViewDetails(false)}
        >
        <div
            className="w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Alert Details
                </h2>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Comprehensive information and delivery status for this alert.
                </p>
            </div>

            <button
                onClick={() => setShowViewDetails(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                type="button"
            >
                <X className="h-5 w-5" />
            </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {normalized.title}
            </h3>

            {/* Status Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <Pill className={priorityPill?.[normalized.priority] || ""}>
                {normalized.priority} priority
                </Pill>
                <Pill className={statusPill?.[normalized.status] || ""}>
                {normalized.status}
                </Pill>

                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-800 dark:text-gray-200">
                <span className="text-base">{meta?.icon}</span>
                {meta?.label || normalized.type}
                </span>
            </div>

            {/* Message */}
            <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Message
                </h4>
                <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                {normalized.message}
                </p>
            </div>

            {/* Info Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Sent By
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {normalized.sentBy || normalized.created_by || "Admin"}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Recipients
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {normalized.roles?.length ? normalized.roles.join(", ") : "—"}
                    </p>
                </div>
                </div>

                <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Date & Time
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {normalized.dateTimeText}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Clipboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Methods
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                        <Mail className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        Email
                    </span>
                    </div>
                </div>
                </div>
            </div>

            <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

            {/* Delivery Stats */}
            {(normalized.status === "sent" || normalized.status === "failed") && (
                <>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Delivery Statistics
                </h4>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-blue-600">
                        {normalized.delivered}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Delivered</p>
                        <div className="mt-4">
                        <ProgressBar value={deliveredPercent} />
                        </div>
                    </CardBody>
                    </Card>

                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-emerald-600">
                        {typeof getReadRate === "function" ? getReadRate(selectedAlert) : 0}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Read (optional)</p>
                        <div className="mt-4">
                        <ProgressBar value={typeof getReadRate === "function" ? getReadRate(selectedAlert) : 0} />
                        </div>
                    </CardBody>
                    </Card>

                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-red-600">
                        {normalized.failed}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Failed</p>
                        {normalized.failed > 0 && (
                        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">
                            Delivery issues detected
                        </p>
                        )}
                    </CardBody>
                    </Card>
                </div>
                </>
            )}

            {/* Failed list (backend details) */}
            {failedList.length > 0 && (
                <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                    Failed Recipients
                </div>

                <div className="mt-4 space-y-3">
                    {failedList.map((r) => (
                    <div
                        key={`${r.user_id}-${r.email}`}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
                    >
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {r.email}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {r.error_message || "Unknown error"}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-gray-100 dark:border-gray-800 pt-5">
                <Button
                variant="outline"
                size="medium"
                onClick={() => setShowViewDetails(false)}
                className="w-full sm:w-auto"
                >
                Close
                </Button>

                {(normalized.status === "sent" || normalized.status === "failed") &&
                normalized.failed > 0 &&
                (userRole === "admin" || userRole === "staff") && (
                    <Button
                    variant="primary"
                    size="medium"
                    onClick={() => handleResendAlert(normalized.id)}
                    disabled={sendingAlert === normalized.id}
                    className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                    {sendingAlert === normalized.id ? (
                        <Clock3 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RotateCcw className="h-4 w-4" />
                    )}
                    Resend
                    </Button>
                )}
            </div>
            </div>
        </div>
        </div>
    );
    }
