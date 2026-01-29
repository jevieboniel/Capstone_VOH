    // UpdateMilestoneModal.jsx
    import React from "react";
    import { Plus, Save, X, Edit } from "lucide-react";

    const UpdateMilestoneModal = ({
    UI,
    editingMilestone,
    setEditingMilestone,
    closeUpdate,
    saveUpdate,
    clamp,
    ProgressBar,
    updateEditingObjective,
    addEditingObjective,
    removeEditingObjective,
    }) => {
    if (!editingMilestone) return null;

    return (
        <div className={UI.modalOverlay}>
        <div className={`${UI.modalBox} max-w-xl`}>
            <div className={UI.modalHeader}>
            <div>
                <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Update Milestone
                </h2>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update progress, status, and notes for this milestone.
                </p>
            </div>

            <button onClick={closeUpdate} className={UI.iconBtn} type="button">
                <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-5 space-y-4">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Child
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                {editingMilestone.child}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Category
                </label>
                <select
                    className={UI.select}
                    value={editingMilestone.category}
                    onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, category: e.target.value }))
                    }
                >
                    <option value="Physical">Physical</option>
                    <option value="Educational">Educational</option>
                    <option value="Social">Social</option>
                    <option value="Emotional">Emotional</option>
                </select>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Status
                </label>
                <select
                    className={UI.select}
                    value={editingMilestone.status}
                    onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, status: e.target.value }))
                    }
                >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Milestone Title
                </label>
                <input
                className={UI.input}
                value={editingMilestone.milestone}
                onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, milestone: e.target.value }))
                }
                placeholder="Milestone title"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
                </label>
                <textarea
                className={UI.textarea}
                rows={3}
                value={editingMilestone.description || ""}
                onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, description: e.target.value }))
                }
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Progress: {clamp(editingMilestone.progress)}%
                </label>

                <input
                type="range"
                min="0"
                max="100"
                value={clamp(editingMilestone.progress)}
                onChange={(e) =>
                    setEditingMilestone((p) => ({
                    ...p,
                    progress: parseInt(e.target.value, 10) || 0,
                    }))
                }
                className="w-full accent-indigo-600 dark:accent-indigo-400"
                />

                <ProgressBar value={editingMilestone.progress} height="h-2" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Target Date
                </label>
                <input
                type="date"
                className={UI.input}
                value={editingMilestone.targetDate || ""}
                onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, targetDate: e.target.value }))
                }
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Objectives
                </label>

                {(editingMilestone.objectives || []).map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                    <input
                    className={UI.input}
                    value={obj}
                    onChange={(e) => updateEditingObjective(idx, e.target.value)}
                    placeholder={`Objective ${idx + 1}`}
                    />

                    {(editingMilestone.objectives || []).length > 1 && (
                    <button
                        onClick={() => removeEditingObjective(idx)}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        type="button"
                        title="Remove objective"
                    >
                        <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                    </button>
                    )}
                </div>
                ))}

                <button type="button" onClick={addEditingObjective} className={UI.btnOutline}>
                <Plus className="h-4 w-4" />
                Add Objective
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Notes
                </label>
                <textarea
                className={UI.textarea}
                rows={3}
                value={editingMilestone.notes || ""}
                onChange={(e) =>
                    setEditingMilestone((p) => ({ ...p, notes: e.target.value }))
                }
                />
            </div>
            </div>

            <div className={UI.modalFooter}>
            <button onClick={closeUpdate} className={UI.btnOutline} type="button">
                Cancel
            </button>

            <button onClick={saveUpdate} className={UI.btnPrimary} type="button">
                <Save className="h-4 w-4" />
                Save Changes
            </button>
            </div>
        </div>
        </div>
    );
    };

    export default UpdateMilestoneModal;
