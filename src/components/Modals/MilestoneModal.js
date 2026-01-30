// Milestonemodal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Target, X, Trash2 } from "lucide-react";
import Button from "../UI/Button";
import { UI } from "../UI/uiTokens";

/* ==========================================================
AddMilestoneModal (DB Children dropdown)
========================================================== */
const Milestonemodal = ({ onClose, onSave, children: childrenList = [] }) => {
    const [childId, setChildId] = useState("");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [notes, setNotes] = useState("");
    const [objectives, setObjectives] = useState([""]);

    // optional: keep dropdown alphabetical
    const sortedChildren = useMemo(() => {
        return [...childrenList].sort((a, b) => {
        const an = (a.fullName || a.name || "").toLowerCase();
        const bn = (b.fullName || b.name || "").toLowerCase();
        return an.localeCompare(bn);
        });
    }, [childrenList]);

    const resetForm = () => {
        setChildId("");
        setCategory("");
        setTitle("");
        setDescription("");
        setTargetDate("");
        setNotes("");
        setObjectives([""]);
    };

    // reset when modal mounts (useful if it stays mounted in DOM sometimes)
    useEffect(() => {
        resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addObjective = () => setObjectives((prev) => [...prev, ""]);

    const updateObjective = (value, index) => {
        setObjectives((prev) => prev.map((o, i) => (i === index ? value : o)));
    };

    const removeObjective = (index) => {
        setObjectives((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.length ? next : [""];
        });
    };

    const closeAndReset = () => {
        resetForm();
        onClose?.();
    };

    const submitForm = () => {
        if (!childId || !category || !title.trim() || !targetDate) {
        alert("Please fill required fields (Child, Category, Milestone Title, Target Date).");
        return;
        }

        // ✅ Clean objectives: remove empty items & trim
        const cleanedObjectives = (objectives || [])
        .map((x) => String(x || "").trim())
        .filter(Boolean);

        onSave?.({
        childId: Number(childId),
        category,
        title: title.trim(),
        description: String(description || "").trim(),
        targetDate,
        objectives: cleanedObjectives,
        notes: String(notes || "").trim(),
        });

        // optional: if parent doesn't unmount immediately, keep it clean
        resetForm();
    };

    return (
        <div className={UI.modalOverlay}>
        <div className={`${UI.modalBox} max-w-2xl`}>
            <div className={UI.modalHeader}>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Target className="h-5 w-5 text-purple-600" />
                Add New Milestone
            </h2>

            <button
                onClick={closeAndReset}
                className={`${UI.iconBtn} text-gray-700 dark:text-gray-200`}
                type="button"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
            </div>

            <div
            className={`${UI.modalBody} space-y-4 max-h-[75vh] overflow-y-auto text-gray-900 dark:text-gray-100`}
            >
            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Child *</label>
                <select
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
                    className={`${UI.select} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700`}
                >
                    <option value="">Select child</option>
                    {sortedChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.fullName || c.name}
                    </option>
                    ))}
                </select>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${UI.select} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700`}
                >
                    <option value="">Select category</option>
                    <option value="Physical">Physical</option>
                    <option value="Educational">Educational</option>
                    <option value="Social">Social</option>
                    <option value="Emotional">Emotional</option>
                </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestone Title *</label>
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reading Level 3"
                className={`${UI.input} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500`}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe milestone..."
                className={`${UI.textarea} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500`}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Date *</label>
                <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`${UI.input} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700`}
                />
            </div>

            {/* Objectives */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Objectives</label>

                <div className="space-y-2">
                {objectives.map((obj, i) => (
                    <div key={i} className="flex gap-2">
                    <input
                        value={obj}
                        onChange={(e) => updateObjective(e.target.value, i)}
                        placeholder={`Objective ${i + 1}`}
                        className={`${UI.input} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500`}
                    />

                    {/* ✅ remove button */}
                    {objectives.length > 1 && (
                        <button
                        type="button"
                        onClick={() => removeObjective(i)}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-label="Remove objective"
                        title="Remove"
                        >
                        <Trash2 className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                        </button>
                    )}
                    </div>
                ))}
                </div>

                <button onClick={addObjective} className={UI.btnOutline} type="button">
                <Plus className="h-4 w-4" />
                Add Objective
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Notes</label>
                <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className={`${UI.textarea} text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500`}
                />
            </div>
            </div>

            <div className={UI.modalFooter}>
            <Button onClick={closeAndReset} variant="outline" type="button" className="px-5 py-2">
                Cancel
            </Button>
            <Button onClick={submitForm} variant="primary" type="button" className="px-5 py-2">
                Create Milestone
            </Button>
            </div>
        </div>
        </div>
    );
};

export default Milestonemodal;
