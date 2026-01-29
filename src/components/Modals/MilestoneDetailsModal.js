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
    // ✅ Hook must be called every render (even when selectedMilestone is null)
    const meta = useMemo(() => {
        if (!selectedMilestone) return null;
        return getCategoryMeta(selectedMilestone.category);
    }, [selectedMilestone, getCategoryMeta]);

    if (!selectedMilestone) return null;

    const Icon = meta?.icon;

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
                    {Icon ? <Icon className={`h-4 w-4 ${meta?.chipIcon || ""}`} /> : null}
                    <span>{selectedMilestone.category}</span>
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

            {/* rest of your modal stays the same */}
            </div>
        </div>
        </div>
    );
    };

    export default MilestoneDetailsModal;
