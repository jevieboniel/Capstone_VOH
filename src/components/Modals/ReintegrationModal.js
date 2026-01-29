// src/components/Modals/ReintegrationModal.js
import React, { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import Button from "../UI/Button";

/* ----------------- Dashboard-like Modal Shell ----------------- */
const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-3xl" }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 md:p-4">
        <div className={`w-full ${maxWidth} max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="px-5 md:px-6 py-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
                {subtitle ? <p className="text-sm text-gray-600 mt-1">{subtitle}</p> : null}
            </div>

            <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                type="button"
                aria-label="Close"
            >
                <X size={18} />
            </button>
            </div>

            <div className="border-t" />

            {/* Body */}
            <div className="px-5 md:px-6 py-6 overflow-y-auto">{children}</div>
        </div>
        </div>
    );
    };

    /* ----------------- Small UI Helpers ----------------- */
    const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {children}
    </div>
    );

    const Input = (props) => (
    <input
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-transparent " +
        "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm " +
        (props.className || "")
        }
    />
    );

    const Select = (props) => (
    <select
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-transparent " +
        "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm " +
        (props.className || "")
        }
    />
    );

    const Textarea = (props) => (
    <textarea
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-transparent " +
        "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm min-h-[110px] resize-none " +
        (props.className || "")
        }
    />
    );

    const formatMMDDYYYY = (date) => {
    if (!date) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split("-");
        return `${m}/${d}/${y}`;
    }
    return date;
    };

    /* ===========================
    ReintegrationModal
    =========================== */
    const ReintegrationModal = ({ child, onClose, onComplete }) => {
    const [form, setForm] = useState(null);

    useEffect(() => {
        if (!child) return;

        setForm({
        adoptiveParents: "",
        relationship: "Adoptive Parents",
        contactNumber: "",
        email: "",
        homeAddress: "",
        reintegrationDate: formatMMDDYYYY(new Date().toISOString().slice(0, 10)),
        followUpSchedule: "3 months",
        homeStudyStatus: "Completed",
        legalStatus: "Approved",
        socialWorker: "",
        courtOrderNumber: "",
        additionalNotes: "",
        });
    }, [child]);

    if (!child || !form) return null;

    const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const fullName = `${child.firstName ?? ""} ${(child.middleName ?? "") ? (child.middleName ?? "") + " " : ""}${child.lastName ?? ""}`.trim();

    const handleComplete = () => {
        const reintegrationRecord = { ...form, createdAt: new Date().toISOString() };
        onComplete({
        ...child,
        reintegration: reintegrationRecord,
        status: "Reintegrated",
        adoptionStatus: "Adopted",
        });
        onClose();
    };

    return (
        <ModalShell
        title="Child Reintegration"
        subtitle={`Recording adoption/reintegration for ${fullName}`}
        onClose={onClose}
        maxWidth="max-w-4xl"
        >
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
            <h3 className="text-blue-700 font-semibold mb-4">Child Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div>
                <p className="mb-2">
                <span className="text-gray-600">Name:</span> {fullName}
                </p>
                <p>
                <span className="text-gray-600">Current House:</span> {child.house || "—"}
                </p>
            </div>
            <div>
                <p className="mb-2">
                <span className="text-gray-600">Age:</span> {child.age} years old
                </p>
                <p>
                <span className="text-gray-600">Adoption Status:</span> {child.adoptionStatus || "—"}
                </p>
            </div>
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Adoptive Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Adoptive Parent(s) Names *">
                <Input value={form.adoptiveParents} onChange={(e) => update("adoptiveParents", e.target.value)} />
            </Field>

            <Field label="Relationship">
                <Select value={form.relationship} onChange={(e) => update("relationship", e.target.value)}>
                <option>Adoptive Parents</option>
                <option>Guardian</option>
                <option>Relative</option>
                <option>Foster Parent</option>
                </Select>
            </Field>

            <Field label="Contact Number *">
                <Input value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} />
            </Field>

            <Field label="Email Address *">
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>

            <div className="md:col-span-2">
                <Field label="Home Address *">
                <Input value={form.homeAddress} onChange={(e) => update("homeAddress", e.target.value)} />
                </Field>
            </div>
            </div>
        </div>

        <hr className="my-8 border-gray-200" />

        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Legal &amp; Administrative Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Reintegration Date">
                <Input value={form.reintegrationDate} onChange={(e) => update("reintegrationDate", e.target.value)} />
            </Field>

            <Field label="Follow-up Schedule">
                <Select value={form.followUpSchedule} onChange={(e) => update("followUpSchedule", e.target.value)}>
                <option>1 month</option>
                <option>3 months</option>
                <option>6 months</option>
                <option>12 months</option>
                </Select>
            </Field>

            <Field label="Home Study Status">
                <Select value={form.homeStudyStatus} onChange={(e) => update("homeStudyStatus", e.target.value)}>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Not Started</option>
                </Select>
            </Field>

            <Field label="Legal Status">
                <Select value={form.legalStatus} onChange={(e) => update("legalStatus", e.target.value)}>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
                </Select>
            </Field>

            <Field label="Assigned Social Worker">
                <Input value={form.socialWorker} onChange={(e) => update("socialWorker", e.target.value)} />
            </Field>

            <Field label="Court Order Number">
                <Input value={form.courtOrderNumber} onChange={(e) => update("courtOrderNumber", e.target.value)} />
            </Field>

            <div className="md:col-span-2">
                <Field label="Additional Notes">
                <Textarea value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} />
                </Field>
            </div>
            </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="medium" onClick={onClose}>
            Cancel
            </Button>

            <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={handleComplete}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
            <UserPlus size={18} />
            Complete Reintegration
            </Button>
        </div>
        </ModalShell>
    );
};

export default ReintegrationModal;
