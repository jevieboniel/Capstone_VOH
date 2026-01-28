// Milestonemodal.jsx
import React, { useState } from "react";
import { Plus, Target, X } from "lucide-react";
import Button from "../UI/Button";
import { UI } from "../UI/uiTokens";

    /* ==========================================================
    AddMilestoneModal (DB Children dropdown)
    ========================================================== */
    const Milestonemodal = ({ onClose, onSave, children = [] }) => {
    const [childId, setChildId] = useState("");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [notes, setNotes] = useState("");
    const [objectives, setObjectives] = useState([""]);

    const addObjective = () => setObjectives([...objectives, ""]);

    const updateObjective = (value, index) => {
        const list = [...objectives];
        list[index] = value;
        setObjectives(list);
    };

    const submitForm = () => {
        if (!childId || !category || !title || !targetDate) {
        alert("Please fill required fields");
        return;
        }

        onSave({
        childId: Number(childId),
        category,
        title,
        description,
        targetDate,
        objectives,
        notes,
        });
    };

    return (
        <div className={UI.modalOverlay}>
        <div className={`${UI.modalBox} max-w-2xl`}>
            <div className={UI.modalHeader}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Add New Milestone
            </h2>
            <button onClick={onClose} className={UI.iconBtn} type="button">
                <X className="h-4 w-4" />
            </button>
            </div>

            <div className={`${UI.modalBody} space-y-4 max-h-[75vh] overflow-y-auto`}>
            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Child *</label>
                <select value={childId} onChange={(e) => setChildId(e.target.value)} className={UI.select}>
                    <option value="">Select child</option>
                    {children.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.fullName || c.name}
                    </option>
                    ))}
                </select>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={UI.select}>
                    <option value="">Select category</option>
                    <option value="Physical">Physical</option>
                    <option value="Educational">Educational</option>
                    <option value="Social">Social</option>
                    <option value="Emotional">Emotional</option>
                </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Milestone Title *</label>
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reading Level 3"
                className={UI.input}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe milestone..."
                className={UI.textarea}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target Date *</label>
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={UI.input} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Objectives</label>
                {objectives.map((obj, i) => (
                <input
                    key={i}
                    value={obj}
                    onChange={(e) => updateObjective(e.target.value, i)}
                    placeholder={`Objective ${i + 1}`}
                    className={UI.input}
                />
                ))}
                <button onClick={addObjective} className={UI.btnOutline} type="button">
                <Plus className="h-4 w-4" />
                Add Objective
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Initial Notes</label>
                <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className={UI.textarea}
                />
            </div>
            </div>

            <div className={UI.modalFooter}>
            <Button onClick={onClose} variant="outline" type="button" className="px-5 py-2">
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
