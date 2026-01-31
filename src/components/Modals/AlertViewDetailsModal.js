import React from "react";
import {
    Info,
    X,
    Mail,
    MessageSquare,
    Bell,
    User,
    Users,
    Calendar,
    Clipboard,
    Clock3,
    RotateCcw,
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
    if (!showViewDetails || !selectedAlert) return null;

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={() => setShowViewDetails(false)}
        >
        <div
            className="w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
        >
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

            <div className="px-6 py-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedAlert.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <Pill className={priorityPill[selectedAlert.priority]}>
                {selectedAlert.priority} priority
                </Pill>
                <Pill className={statusPill[selectedAlert.status]}>
                {selectedAlert.status}
                </Pill>

                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-800 dark:text-gray-200">
                <span className="text-base">{typeMeta(selectedAlert.type)?.icon}</span>
                {typeMeta(selectedAlert.type)?.label}
                </span>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Message
                </h4>
                <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                {selectedAlert.message}
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Sent By
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {selectedAlert.sentBy}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Recipients
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {selectedAlert.recipients.join(", ")}
                    </p>
                </div>
                </div>

                <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Date &amp; Time
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200">
                    {formatDateTime(selectedAlert.sentDate, selectedAlert.sentTime)}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                    <Clipboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    Methods
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAlert.notificationMethods.map((m) => (
                        <span
                        key={m}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                        >
                        {m === "email" && (
                            <Mail className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                        {m === "sms" && (
                            <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                        {m === "inApp" && (
                            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                        {m}
                        </span>
                    ))}
                    </div>
                </div>
                </div>
            </div>

            <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

            {selectedAlert.status === "sent" && (
                <>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Delivery Statistics
                </h4>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-blue-600">
                        {selectedAlert.deliveryStatus.delivered}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Delivered
                        </p>
                        <div className="mt-4">
                        <ProgressBar
                            value={Math.round(
                            (selectedAlert.deliveryStatus.delivered /
                                selectedAlert.totalRecipients) *
                                100
                            )}
                        />
                        </div>
                    </CardBody>
                    </Card>

                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-emerald-600">
                        {selectedAlert.deliveryStatus.read}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Read</p>
                        <div className="mt-4">
                        <ProgressBar value={getReadRate(selectedAlert)} />
                        </div>
                    </CardBody>
                    </Card>

                    <Card>
                    <CardBody className="text-center">
                        <p className="text-4xl font-extrabold text-red-600">
                        {selectedAlert.deliveryStatus.failed}
                        </p>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Failed
                        </p>
                        {selectedAlert.deliveryStatus.failed > 0 && (
                        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">
                            Delivery issues detected
                        </p>
                        )}
                    </CardBody>
                    </Card>
                </div>
                </>
            )}

            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-gray-100 dark:border-gray-800 pt-5">
                <Button
                variant="outline"
                size="medium"
                onClick={() => setShowViewDetails(false)}
                className="w-full sm:w-auto"
                >
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
                    className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                    {sendingAlert === selectedAlert.id ? (
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
