    // src/components/Modals/ChildrenModals.js
    import React, { useEffect, useState } from "react";
    import {
    X,
    Calendar,
    MapPin,
    User,
    Phone,
    Heart,
    FileText,
    LineChart,
    Stethoscope,
    GraduationCap,
    Pencil,
    UserPlus,
    } from "lucide-react";

    import Button from "../UI/Button";

    /* ----------------- Badge Color Helpers ----------------- */
    export const getStatusColor = (status) => {
    switch (status) {
        case "Active":
        return "bg-green-100 text-green-800 border-green-200";
        case "Transitioning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Transferred":
        return "bg-blue-100 text-blue-800 border-blue-200";
        case "Reintegrated":
        return "bg-purple-100 text-purple-800 border-purple-200";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
    };

    export const getHealthStatusColor = (status) => {
    switch (status) {
        case "Excellent":
        return "bg-green-100 text-green-800 border-green-200";
        case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200";
        case "Needs Check-up":
        return "bg-orange-100 text-orange-800 border-orange-200";
        case "Requires Attention":
        return "bg-red-100 text-red-800 border-red-200";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
    };

    export const getAdoptionStatusColor = (status) => {
    switch (status) {
        case "Open for Adoption":
        return "bg-blue-100 text-blue-800 border-blue-200";
        case "Adopted":
        return "bg-green-100 text-green-800 border-green-200";
        case "Not Available for Adoption":
        return "bg-gray-100 text-gray-800 border-gray-200";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
    };

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
    AddChildModal
    =========================== */
    export const AddChildModal = ({ onClose, onAddChild }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        age: "",
        gender: "",
        admissionDate: "",
        house: "",
        houseParent: "",
        healthStatus: "Good",
        educationLevel: "",
        emergencyContact: "",
        caseType: "",
        status: "Active",
        adoptionStatus: "Not Available for Adoption",
        notes: "",
        photo: null,
        lastCheckup: "",
    });

    const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => setFormData((p) => ({ ...p, photo: e.target.files?.[0] || null }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddChild(formData);
    };

    return (
        <ModalShell
        title="Add New Child"
        subtitle="Fill in the information below to add a new child to the system."
        onClose={onClose}
        maxWidth="max-w-3xl"
        >
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="First Name *">
                <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
            </Field>
            <Field label="Middle Name">
                <Input name="middleName" value={formData.middleName} onChange={handleChange} />
            </Field>
            <Field label="Last Name *">
                <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
            </Field>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Age *">
                <Input type="number" name="age" value={formData.age} onChange={handleChange} required />
            </Field>
            <Field label="Gender *">
                <Select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                </Select>
            </Field>
            </div>

            {/* Admission + Last Checkup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Admission Date">
                <Input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} />
            </Field>
            <Field label="Last Check-up">
                <Input name="lastCheckup" placeholder="MM/DD/YYYY" value={formData.lastCheckup} onChange={handleChange} />
            </Field>
            </div>

            {/* House + House Parent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="House *">
                <Select name="house" value={formData.house} onChange={handleChange} required>
                <option value="">Select house</option>
                <option>Sunshine House</option>
                <option>Rainbow House</option>
                <option>Hope House</option>
                </Select>
            </Field>

            <Field label="House Parent *">
                <Select name="houseParent" value={formData.houseParent} onChange={handleChange} required>
                <option value="">Select house parent</option>
                <option>David Thompson</option>
                <option>Emily Rodriguez</option>
                <option>Michael Chen</option>
                </Select>
            </Field>
            </div>

            {/* Health + Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Health Status">
                <Select name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Needs Check-up</option>
                <option>Requires Attention</option>
                </Select>
            </Field>

            <Field label="Education Level *">
                <Input
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                placeholder="e.g. Grade 1, Pre-school"
                required
                />
            </Field>
            </div>

            {/* Emergency */}
            <Field label="Emergency Contact">
            <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
            </Field>

            {/* Case Type */}
            <Field label="Case Type *">
            <Select name="caseType" value={formData.caseType} onChange={handleChange} required>
                <option value="">Select case type</option>
                <option>Orphan</option>
                <option>Abandoned</option>
                <option>Rescued</option>
            </Select>
            </Field>

            {/* Status + Adoption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Status *">
                <Select name="status" value={formData.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Transitioning</option>
                <option>Transferred</option>
                <option>Reintegrated</option>
                </Select>
            </Field>

            <Field label="Adoption Status *">
                <Select name="adoptionStatus" value={formData.adoptionStatus} onChange={handleChange}>
                <option>Not Available for Adoption</option>
                <option>Open for Adoption</option>
                <option>Adopted</option>
                </Select>
            </Field>
            </div>

            {/* Photo */}
            <Field label="Profile Image / Photo">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            </Field>

            {/* Notes */}
            <Field label="Notes">
            <Textarea name="notes" value={formData.notes} onChange={handleChange} />
            </Field>

            {/* Actions (use UI Button) */}
            <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="medium" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" className="flex items-center gap-2">
                Add Child
            </Button>
            </div>
        </form>
        </ModalShell>
    );
    };

    /* ===========================
    EditProfileModal
    =========================== */
    export const EditProfileModal = ({ child, onClose, onSave }) => {
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
            <img src={currentPhoto} alt={fullName} className="w-12 h-12 rounded-full object-cover" />
            <div className="min-w-0">
            <p className="text-sm text-gray-600">Editing profile for</p>
            <p className="text-base font-semibold text-gray-900 truncate">{fullName}</p>
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
                <p className="text-xs text-gray-500 mt-2">Leave empty if you don’t want to change the photo.</p>
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
            <Button type="button" variant="primary" size="medium" onClick={handleSave} className="flex items-center gap-2">
            <FileText size={16} />
            Save Changes
            </Button>
        </div>
        </ModalShell>
    );
    };

    /* ===========================
    ChildDetailModal
    =========================== */
    export const ChildDetailModal = ({ child, onClose, onEdit, onViewDevelopment }) => {
    if (!child) return null;

    const firstName = child.firstName ?? child.first_name ?? "";
    const middleName = child.middleName ?? child.middle_name ?? "";
    const lastName = child.lastName ?? child.last_name ?? "";
    const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();

    return (
        <ModalShell title={fullName} subtitle={`${child.age} years old • ${child.gender}`} onClose={onClose} maxWidth="max-w-3xl">
        {/* Header chips */}
        <div className="flex items-start gap-4">
            <img
            src={child.photoUrl || child.image}
            alt={fullName}
            className="w-14 h-14 rounded-full object-cover"
            />

            <div className="flex-1">
            <div className="flex flex-wrap gap-2">
                {child.status && (
                <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(child.status)}`}>
                    {child.status}
                </span>
                )}
                {child.healthStatus && (
                <span className={`text-xs px-3 py-1 rounded-full border ${getHealthStatusColor(child.healthStatus)}`}>
                    {child.healthStatus}
                </span>
                )}
                {child.adoptionStatus && (
                <span className={`text-xs px-3 py-1 rounded-full border ${getAdoptionStatusColor(child.adoptionStatus)}`}>
                    {child.adoptionStatus}
                </span>
                )}
            </div>
            </div>
        </div>

        {/* Body */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
            <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Admission Date: {child.admissionDate || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>House: {child.house || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span>House Parent: {child.houseParent || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>Emergency: {child.emergencyContact || "—"}</span>
                </div>
            </div>
            </div>

            <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health &amp; Education</h3>
            <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                <Heart size={16} className="text-gray-400" />
                <span>Health Status: {child.healthStatus || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Last Check-up: {child.lastCheckup || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span>Education Level: {child.educationLevel || "—"}</span>
                </div>
            </div>
            </div>
        </div>

        {/* Notes */}
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="p-4 bg-gray-50 rounded-xl text-gray-700">{child.notes || "—"}</div>
        </div>

        {/* Actions (use UI Button for consistent sizes) */}
        <div className="mt-8 flex flex-wrap gap-3">
            <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={() => onViewDevelopment?.(child)}
            className="flex items-center gap-2"
            >
            <LineChart size={16} />
            View Development
            </Button>

            <Button type="button" variant="outline" size="medium" className="flex items-center gap-2">
            <Stethoscope size={16} />
            Health Records
            </Button>

            <Button type="button" variant="outline" size="medium" className="flex items-center gap-2">
            <GraduationCap size={16} />
            Education Records
            </Button>

            <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={() => onEdit?.(child)}
            className="flex items-center gap-2"
            >
            <Pencil size={16} />
            Edit Profile
            </Button>
        </div>
        </ModalShell>
    );
    };

    /* ===========================
    ReintegrationModal
    =========================== */
    export const ReintegrationModal = ({ child, onClose, onComplete }) => {
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
