// MilestoneDetailsModal.jsx
import React from "react";
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
    if (!selectedMilestone) return null;

    return (
        <div className={UI.modalOverlay}>
        <div className={`${UI.modalBox} max-w-2xl`}>
            <div className={UI.modalHeader}>
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h2 className="text-base font-semibold text-gray-900">Milestone Details</h2>
            </div>
            <button onClick={closeDetails} className={UI.iconBtn} type="button">
                <X className="h-4 w-4" />
            </button>
            </div>

            <div className={`${UI.modalBody} space-y-4`}>
            <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-100 text-base font-semibold text-gray-700">
                {initials(selectedMilestone.child)}
                </div>

                <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedMilestone.child}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    {(() => {
                    const meta = getCategoryMeta(selectedMilestone.category);
                    const Icon = meta.icon;
                    return (
                        <>
                        <Icon className={`h-4 w-4 ${meta.chipIcon}`} />
                        <span>{selectedMilestone.category}</span>
                        </>
                    );
                    })()}
                </div>
                </div>

                <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    selectedMilestone.status
                )}`}
                >
                {getStatusIcon(selectedMilestone.status)}
                <span>{selectedMilestone.status}</span>
                </span>
            </div>

            <div className="h-px bg-gray-200" />

            <div>
                <h4 className="mb-2 font-medium text-gray-900">{selectedMilestone.milestone}</h4>
                <p className="text-sm text-gray-700">{selectedMilestone.description || "—"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <p className="text-sm font-medium text-gray-600">Assigned By</p>
                <p className="text-sm text-gray-900">{selectedMilestone.assignedBy || "—"}</p>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-600">Target Date</p>
                <p className="text-sm text-gray-900">
                    {selectedMilestone.targetDate ? formatDate(selectedMilestone.targetDate) : "—"}
                </p>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-600">Created Date</p>
                <p className="text-sm text-gray-900">
                    {selectedMilestone.createdDate ? formatDate(selectedMilestone.createdDate) : "—"}
                </p>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">
                    {selectedMilestone.lastUpdated ? formatDate(selectedMilestone.lastUpdated) : "—"}
                </p>
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-lg font-bold text-gray-900">{clamp(selectedMilestone.progress)}%</p>
                </div>
                <ProgressBar value={selectedMilestone.progress} height="h-3" />
            </div>

            {selectedMilestone.objectives?.length > 0 && (
                <div>
                <p className="mb-2 text-sm font-medium text-gray-600">Objectives</p>
                <ul className="space-y-1">
                    {selectedMilestone.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600">•</span>
                        <span>{obj}</span>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            {selectedMilestone.notes && (
                <div>
                <p className="mb-2 text-sm font-medium text-gray-600">Current Notes</p>
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">{selectedMilestone.notes}</div>
                </div>
            )}
            </div>
        </div>
        </div>
    );
};

export default MilestoneDetailsModal;
