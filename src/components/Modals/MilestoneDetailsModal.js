// MilestoneDetailsModal.jsx
import React, { useMemo } from "react";
import { FileText, X } from "lucide-react";


const MilestoneDetailsModal = ({
    UI,
    selectedMilestone,
    closeDetails,
    initials,
    getCategoryMeta,
    getStatusColor,
    getStatusIcon,
    formatDate,
    clamp,
    ProgressBar,
    }) => {
    // Hooks MUST be called before any return
    const meta = useMemo(() => {
        if (!selectedMilestone) return null;
        return getCategoryMeta(selectedMilestone.category);
    }, [selectedMilestone, getCategoryMeta]);

    // return AFTER hooks
    if (!selectedMilestone) return null;

    const Icon = meta?.icon;

    // accept either snake_case or camelCase from API
    const childName =
        selectedMilestone.child ||
        selectedMilestone.child_name ||
        selectedMilestone.fullName ||
        selectedMilestone.name ||
        "—";

    const title = selectedMilestone.title ?? "—";
    const description = selectedMilestone.description ?? "";

    const status = selectedMilestone.status ?? "Planned";
    const category = selectedMilestone.category ?? "—";

    const assignedBy = selectedMilestone.assignedBy ?? selectedMilestone.assigned_by ?? "—";

    const targetDateRaw = selectedMilestone.targetDate ?? selectedMilestone.target_date ?? null;
    const createdDateRaw =
        selectedMilestone.createdDate ??
        selectedMilestone.created_date ??
        selectedMilestone.created_at ??
        null;
    const lastUpdatedRaw =
        selectedMilestone.lastUpdated ??
        selectedMilestone.last_updated ??
        selectedMilestone.updated_at ??
        null;

    const targetDate = targetDateRaw ? formatDate(targetDateRaw) : "—";
    const createdDate = createdDateRaw ? formatDate(createdDateRaw) : "—";
    const lastUpdated = lastUpdatedRaw ? formatDate(lastUpdatedRaw) : "—";

    const progressRaw = selectedMilestone.progress ?? 0;
    const safeProgress =
        clamp?.(Number(progressRaw), 0, 100) ?? Math.max(0, Math.min(100, Number(progressRaw)));

    // objectives might come from another table; support a few common shapes
    const objectives = Array.isArray(selectedMilestone.objectives)
        ? selectedMilestone.objectives
        : Array.isArray(selectedMilestone.objective_list)
        ? selectedMilestone.objective_list
        : [];

    // notes/current notes
    const currentNotes =
        selectedMilestone.currentNotes ??
        selectedMilestone.current_notes ??
        selectedMilestone.notes ??
        "—";

    return (
        <div className={UI.modalOverlay}>
        <div className={`${UI.modalBox} max-w-2xl`}>
            {/* Header */}
            <div className={UI.modalHeader}>
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Milestone Details
                </h2>
            </div>

            <button
                onClick={closeDetails}
                className={`${UI.iconBtn} text-gray-700 dark:text-gray-200`}
                type="button"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
            </div>

            {/* Body */}
            <div
            className={`${UI.modalBody} space-y-5 max-h-[75vh] overflow-y-auto text-gray-900 dark:text-gray-100`}
            >
            {/* Child row */}
            <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-base font-semibold text-gray-700 dark:text-gray-100">
                {initials(childName)}
                </div>

                <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {childName}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {Icon ? <Icon className={`h-4 w-4 ${meta?.chipIcon || ""}`} /> : null}
                    <span>{category}</span>
                </div>
                </div>

                {/* Status pill (color comes from your getStatusColor) */}
                <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    status
                )}`}
                >
                {getStatusIcon(status)}
                <span>{status}</span>
                </span>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Title + description */}
            <div className="space-y-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
                {description ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                ) : null}
            </div>

            {/* 2-column details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoPair label="Assigned By" value={assignedBy} />
                <InfoPair label="Target Date" value={targetDate} />
                <InfoPair label="Created Date" value={createdDate} />
                <InfoPair label="Last Updated" value={lastUpdated} />
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(safeProgress)}%
                </div>
                </div>

                {ProgressBar ? (
                <ProgressBar value={safeProgress} />
                ) : (
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                    className="h-full rounded-full bg-gray-900 dark:bg-purple-500"
                    style={{ width: `${safeProgress}%` }}
                    />
                </div>
                )}
            </div>

            {/* Objectives */}
            <section className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Objectives</h5>

                {objectives.length ? (
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {objectives.map((obj, idx) => (
                    <li key={idx} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="leading-6">{String(obj || "")}</span>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No objectives added.</p>
                )}
            </section>

            {/* Current Notes */}
            <section className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Current Notes</h5>
                <div className="rounded-xl bg-blue-50 dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-200">
                {currentNotes}
                </div>
            </section>
            </div>
        </div>
        </div>
    );
    };

    function InfoPair({ label, value }) {
    return (
        <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
        </div>
    );
}

export default MilestoneDetailsModal;
