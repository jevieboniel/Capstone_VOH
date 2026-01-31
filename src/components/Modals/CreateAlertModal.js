import React from "react";
import { Bell, X, Mail, MessageSquare, Send } from "lucide-react";
import Button from "../UI/Button";

export default function CreateAlertModal({
    showCreateAlert,
    setShowCreateAlert,
    newAlert,
    setNewAlert,
    alertTypes,
    recipientGroups,
    toggleRecipient,
    toggleNotificationMethod,
    formatTime12,
    handleCreateAlert,
    Input,
    Select,
    }) {
    if (!showCreateAlert) return null;

    return (
        <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
        onClick={() => setShowCreateAlert(false)}
        >
        <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 ring-1 ring-red-100 dark:ring-red-500/20">
                <Bell className="h-5 w-5 text-red-600 dark:text-red-300" />
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create New Alert
                </h2>
            </div>
            <button
                onClick={() => setShowCreateAlert(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                type="button"
            >
                <X className="h-4 w-4" />
            </button>
            </div>

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Notify staff and house parents about important updates.
            </p>

            <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Alert Title <span className="text-red-500">*</span>
                </label>
                <Input
                    value={newAlert.title}
                    onChange={(e) =>
                    setNewAlert((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter alert title"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Alert Type
                </label>
                <Select
                    value={newAlert.type}
                    onChange={(e) =>
                    setNewAlert((prev) => ({ ...prev, type: e.target.value }))
                    }
                >
                    {alertTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                    </option>
                    ))}
                </Select>
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                Message <span className="text-red-500">*</span>
                </label>
                <textarea
                rows={4}
                value={newAlert.message}
                onChange={(e) =>
                    setNewAlert((prev) => ({ ...prev, message: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30"
                placeholder="Enter the alert message..."
                />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                Priority Level
                </label>
                <Select
                value={newAlert.priority}
                onChange={(e) =>
                    setNewAlert((prev) => ({ ...prev, priority: e.target.value }))
                }
                >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
                </Select>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                Recipients <span className="text-red-500">*</span>{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                    (select at least one)
                </span>
                </label>
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                {recipientGroups.map((group) => (
                    <label
                    key={group}
                    className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 dark:text-gray-200"
                    >
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
                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                Selected: {newAlert.recipients.length} groups
                </p>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                Notification Methods
                </label>
                <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
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

                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
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

                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
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
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Schedule Date (optional)
                </label>
                <Input
                    type="date"
                    value={newAlert.scheduleDate}
                    onChange={(e) =>
                    setNewAlert((prev) => ({
                        ...prev,
                        scheduleDate: e.target.value,
                    }))
                    }
                />
                </div>

                <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Schedule Time (optional)
                </label>
                <Input
                    type="time"
                    value={newAlert.scheduleTime}
                    onChange={(e) =>
                    setNewAlert((prev) => ({
                        ...prev,
                        scheduleTime: e.target.value,
                    }))
                    }
                />
                </div>
            </div>

            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 px-4 py-3 text-xs text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-500/20">
                <strong>Preview:</strong> Your alert will be sent to{" "}
                {newAlert.recipients.length} group
                {newAlert.recipients.length === 1 ? "" : "s"}
                {newAlert.scheduleDate ? ` on ${newAlert.scheduleDate}` : " immediately"}
                {newAlert.scheduleTime ? ` at ${formatTime12(newAlert.scheduleTime)}` : ""}.
            </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
                variant="outline"
                size="medium"
                onClick={() => setShowCreateAlert(false)}
                className="w-full sm:w-auto"
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                size="medium"
                onClick={handleCreateAlert}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
                <Send className="h-4 w-4" />
                {newAlert.scheduleDate ? "Schedule Alert" : "Send Alert"}
            </Button>
            </div>
        </div>
        </div>
    );
}
