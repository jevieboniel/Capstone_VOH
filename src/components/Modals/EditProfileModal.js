    // src/components/Modals/EditProfileModal.js
    import React, { useEffect, useState } from "react";
    import { X, FileText } from "lucide-react";
    import Button from "../UI/Button";

    /* ----------------- Dashboard-like Modal Shell ----------------- */
    const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-3xl" }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-3 md:p-4">
        <div
            className={`w-full ${maxWidth} max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-300`}
        >
            {/* Header */}
            <div className="px-5 md:px-6 py-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
                </h2>
                {subtitle ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                ) : null}
            </div>

            <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors"
                type="button"
                aria-label="Close"
            >
                <X size={18} />
            </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Body */}
            <div className="px-5 md:px-6 py-6 overflow-y-auto">{children}</div>
        </div>
        </div>
    );
    };

    /* ----------------- Small UI Helpers ----------------- */
    const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children}
    </div>
    );

    const Input = (props) => (
    <input
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-950 border border-transparent " +
        "focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 " +
        "outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
        (props.className || "")
        }
    />
    );

    const Select = (props) => (
    <select
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-950 border border-transparent " +
        "focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 " +
        "outline-none text-sm text-gray-900 dark:text-gray-100 " +
        (props.className || "")
        }
    />
    );

    const Textarea = (props) => (
    <textarea
        {...props}
        className={
        "w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-950 border border-transparent " +
        "focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 " +
        "outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
        "min-h-[110px] resize-none " +
        (props.className || "")
        }
    />
    );

    /* ===========================
    EditProfileModal
    =========================== */
    const EditProfileModal = ({ child, onClose, onSave }) => {
    const [form, setForm] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!child) return;

        setForm({
        firstName: child.firstName ?? child.first_name ?? "",
        middleName: child.middleName ?? child.middle_name ?? "",
        lastName: child.lastName ?? child.last_name ?? "",
        age: child.age ?? "",
        gender: child.gender ?? "",
        admissionDate: child.admissionDate ?? child.admission_date ?? "",
        house: child.house ?? "",
        houseParent: child.houseParent ?? child.house_parent ?? "",
        healthStatus: child.healthStatus ?? child.health_status ?? "Good",
        educationLevel: child.educationLevel ?? child.education_level ?? "",
        emergencyContact: child.emergencyContact ?? child.emergency_contact ?? "",
        caseType: child.caseType ?? child.case_type ?? "",
        status: child.status ?? "Active",
        adoptionStatus: child.adoptionStatus ?? child.adoption_status ?? "Not Available for Adoption",
        notes: child.notes ?? "",
        lastCheckup: child.lastCheckup ?? child.last_checkup ?? "",
        photo: null,
        });

        setPreview(null);
    }, [child]);

    useEffect(() => {
        return () => {
        if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    if (!child || !form) return null;

    const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        update("photo", file);

        if (preview) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSave = () => {
        onSave({ ...child, ...form });
        onClose();
    };

    const fullName = `${form.firstName} ${form.middleName ? form.middleName + " " : ""}${form.lastName}`.trim();
    const currentPhoto =
        preview ||
        child.photoUrl ||
        child.photo_url ||
        child.photo ||
        child.image ||
        "https://i.pravatar.cc/100";

    return (
        <ModalShell title="Edit Child" subtitle={fullName} onClose={onClose} maxWidth="max-w-3xl">
        <div className="flex items-center gap-3 mb-5">
            <img
            src={currentPhoto}
            alt={fullName}
            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-800"
            />
            <div className="min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">Editing profile for</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="First Name *">
            <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </Field>

            <Field label="Middle Name">
            <Input value={form.middleName} onChange={(e) => update("middleName", e.target.value)} />
            </Field>

            <Field label="Last Name *">
            <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </Field>

            <Field label="Age *">
            <Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} required />
            </Field>

            <Field label="Gender *">
            <Select value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
            </Select>
            </Field>

            <Field label="Admission Date">
            <Input type="date" value={form.admissionDate} onChange={(e) => update("admissionDate", e.target.value)} />
            </Field>

            <Field label="House *">
            <Select value={form.house} onChange={(e) => update("house", e.target.value)} required>
                <option value="">Select house</option>
                <option>Sunshine House</option>
                <option>Hope House</option>
                <option>Rainbow House</option>
            </Select>
            </Field>

            <Field label="House Parent *">
            <Select value={form.houseParent} onChange={(e) => update("houseParent", e.target.value)} required>
                <option value="">Select house parent</option>
                <option>David Thompson</option>
                <option>Emily Rodriguez</option>
                <option>Michael Chen</option>
            </Select>
            </Field>

            <Field label="Health Status">
            <Select value={form.healthStatus} onChange={(e) => update("healthStatus", e.target.value)}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Needs Check-up</option>
                <option>Requires Attention</option>
            </Select>
            </Field>

            <Field label="Education Level *">
            <Input value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} required />
            </Field>

            <Field label="Emergency Contact">
            <Input value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} />
            </Field>

            <Field label="Case Type *">
            <Select value={form.caseType} onChange={(e) => update("caseType", e.target.value)} required>
                <option value="">Select case type</option>
                <option>Orphan</option>
                <option>Abandoned</option>
                <option>Rescued</option>
            </Select>
            </Field>

            <Field label="Last Check-up">
            <Input value={form.lastCheckup} onChange={(e) => update("lastCheckup", e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>

            <Field label="Status *">
            <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Transitioning</option>
                <option>Transferred</option>
                <option>Reintegrated</option>
            </Select>
            </Field>

            <Field label="Adoption Status *">
            <Select value={form.adoptionStatus} onChange={(e) => update("adoptionStatus", e.target.value)}>
                <option>Not Available for Adoption</option>
                <option>Open for Adoption</option>
                <option>Adopted</option>
            </Select>
            </Field>

            <div className="md:col-span-3">
            <Field label="Profile Image / Photo">
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Leave empty if you don’t want to change the photo.
                </p>
            </Field>
            </div>

            <div className="md:col-span-3">
            <Field label="Notes">
                <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </Field>
            </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="medium" onClick={onClose}>
            Cancel
            </Button>
            <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={handleSave}
            className="flex items-center gap-2"
            >
            <FileText size={16} />
            Save Changes
            </Button>
        </div>
        </ModalShell>
    );
    };

    export default EditProfileModal;
