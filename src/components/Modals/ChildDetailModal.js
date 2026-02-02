// src/components/Modals/ChildDetailModal.js
import React, { useEffect, useMemo, useState } from "react";
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
    Plus,
    Save,
    Award,
    } from "lucide-react";
    import Button from "../UI/Button";

    /* ----------------- Badge Color Helpers ----------------- */
    export const getStatusColor = (status) => {
    switch (status) {
        case "Active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900";
        case "Transitioning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-900";
        case "Transferred":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900";
        case "Reintegrated":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-900";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
    }
    };

    export const getHealthStatusColor = (status) => {
    switch (status) {
        case "Excellent":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900";
        case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900";
        case "Needs Check-up":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900";
        case "Requires Attention":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
    }
    };

    export const getAdoptionStatusColor = (status) => {
    switch (status) {
        case "Open for Adoption":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900";
        case "Adopted":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900";
        case "Not Available for Adoption":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
        default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
    }
    };

    /* ----------------- Date helpers ----------------- */
    const pad2 = (n) => String(n).padStart(2, "0");

    /** For <input type="date">; accepts multiple formats; returns "YYYY-MM-DD" */
    const toDateInputValue = (value) => {
    if (!value) return "";
    try {
        if (value instanceof Date) {
        return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
        }
        const s = String(value).trim();
        if (!s) return "";

        // YYYY-MM-DD
        if (s.includes("-") && s.split("-").length >= 3) {
        const [yy, mm, dd] = s.split("-");
        if (yy.length === 4) return `${yy}-${pad2(mm)}-${pad2(dd)}`;
        }

        // MM/DD/YYYY
        if (s.includes("/") && s.split("/").length === 3) {
        const [m, d, y] = s.split("/");
        if (String(y).length === 4) return `${y}-${pad2(m)}-${pad2(d)}`;
        }

        const dt = new Date(s);
        if (Number.isNaN(dt.getTime())) return "";
        return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    } catch {
        return "";
    }
    };

    const formatShortDate = (value) => {
    if (!value) return "—";
    try {
        const iso = toDateInputValue(value);
        if (iso) {
        const dt = new Date(iso);
        if (!Number.isNaN(dt.getTime())) {
            return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
        }
        }
        return String(value);
    } catch {
        return String(value);
    }
    };

    /* ----------------- Modal Shell ----------------- */
    const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-3xl" }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-3 md:p-4">
        <div
            className={`w-full ${maxWidth} max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-300`}
        >
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
            <div className="px-5 md:px-6 py-6 overflow-y-auto">{children}</div>
        </div>
        </div>
    );
    };

    /* ----------------- Shared Form UI ----------------- */
    const FieldLabel = ({ children }) => (
    <label className="text-sm font-medium text-gray-800 dark:text-gray-200">{children}</label>
    );

    const TextInput = ({ className = "", ...props }) => (
    <input
        {...props}
        className={[
        "w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800",
        "border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/40",
        "outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
        className,
        ].join(" ")}
    />
    );

    const SelectInput = ({ className = "", ...props }) => (
    <select
        {...props}
        className={[
        "w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800",
        "border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/40",
        "outline-none text-gray-900 dark:text-gray-100",
        className,
        ].join(" ")}
    />
    );

    const TextArea = ({ className = "", ...props }) => (
    <textarea
        {...props}
        className={[
        "w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800",
        "border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/40",
        "outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "min-h-[120px] resize-y",
        className,
        ].join(" ")}
    />
    );

    /* =========================================================
    HEALTH RECORDS (Modal + Add/Edit)
    ========================================================= */
    const HEALTH_RECORD_TYPES = [
    "Routine Check-up",
    "Vaccination",
    "Dental Check-up",
    "Lab Test",
    "Medication",
    "Specialist Visit",
    "Other",
    ];

    const HealthRecordCard = ({ record, onEdit }) => {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
            <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {record.type || "Health Record"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{record.provider || "—"}</p>

            <p className="text-sm text-gray-800 dark:text-gray-200 mt-4 whitespace-pre-wrap">
                {record.notes || "—"}
            </p>

            {record.nextAppointment ? (
                <button type="button" className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Next Appointment: {formatShortDate(record.nextAppointment)}
                </button>
            ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/30 text-gray-900 dark:text-gray-100">
                {formatShortDate(record.date)}
            </span>

            <button
                type="button"
                onClick={onEdit}
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/30 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors"
                aria-label="Edit record"
                title="Edit"
            >
                <Pencil size={16} />
            </button>
            </div>
        </div>
        </div>
    );
    };

    const HealthRecordsModal = ({ childName, records, onClose, onAddClick, onEditClick, loading, error }) => {
    return (
        <ModalShell
        title={
            <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 flex items-center justify-center">
                <Stethoscope size={18} className="text-blue-600 dark:text-blue-400" />
            </span>
            <span>Health Records</span>
            </span>
        }
        subtitle={childName}
        onClose={onClose}
        maxWidth="max-w-4xl"
        >
        <div className="flex items-center justify-end mb-5">
            <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={onAddClick}
            className="flex items-center gap-2"
            >
            <Plus size={16} />
            Add Record
            </Button>
        </div>

        {loading ? (
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-200">
            Loading health records...
            </div>
        ) : error ? (
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
            {error}
            </div>
        ) : records?.length ? (
            <div className="space-y-5">
            {records.map((r) => (
                <HealthRecordCard key={r.id} record={r} onEdit={() => onEditClick?.(r)} />
            ))}
            </div>
        ) : (
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-900 dark:text-gray-100 font-semibold">No health records yet</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Click “Add Record” to create the first one.
            </p>
            </div>
        )}
        </ModalShell>
    );
    };

    const HealthRecordFormModal = ({ mode = "add", childName, initial, onClose, onSubmit, saving, error }) => {
    const [type, setType] = useState(initial?.type || "");
    const [provider, setProvider] = useState(initial?.provider || "");
    const [date, setDate] = useState(toDateInputValue(initial?.date) || "");
    const [notes, setNotes] = useState(initial?.notes || "");
    const [nextAppointment, setNextAppointment] = useState(toDateInputValue(initial?.nextAppointment) || "");

    useEffect(() => {
        setType(initial?.type || "");
        setProvider(initial?.provider || "");
        setDate(toDateInputValue(initial?.date) || "");
        setNotes(initial?.notes || "");
        setNextAppointment(toDateInputValue(initial?.nextAppointment) || "");
    }, [initial]);

    const title = mode === "edit" ? "Edit Health Record" : "Add Health Record";

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
        ...initial,
        type: type.trim(),
        provider: provider.trim(),
        date: date || "",
        notes: notes.trim(),
        nextAppointment: nextAppointment || "",
        };
        if (!payload.type || !payload.provider || !payload.date || !payload.notes) return;
        onSubmit?.(payload);
    };

    return (
        <ModalShell title={title} subtitle={null} onClose={onClose} maxWidth="max-w-2xl">
        {mode === "add" ? (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-gray-800 dark:text-gray-200 mb-6">
            Adding health record for: <span className="font-semibold">{childName}</span>
            </div>
        ) : null}

        {error ? (
            <div className="mb-5 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
            {error}
            </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <FieldLabel>Record Type *</FieldLabel>
            <SelectInput value={type} onChange={(e) => setType(e.target.value)} required disabled={saving}>
                <option value="" disabled>
                Select record type
                </option>
                {HEALTH_RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                    {t}
                </option>
                ))}
            </SelectInput>
            </div>

            <div>
            <FieldLabel>Doctor/Healthcare Provider *</FieldLabel>
            <TextInput
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Dr. Sarah Wilson"
                required
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Date *</FieldLabel>
            <div className="relative">
                <TextInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="pr-10"
                disabled={saving}
                />
                <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                />
            </div>
            </div>

            <div>
            <FieldLabel>Findings/Notes *</FieldLabel>
            <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter examination findings, diagnoses, treatments, or notes"
                required
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Next Appointment (Optional)</FieldLabel>
            <div className="relative">
                <TextInput
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="pr-10"
                disabled={saving}
                />
                <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                />
            </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={saving}>
                Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" className="flex items-center gap-2" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Record"}
            </Button>
            </div>
        </form>
        </ModalShell>
    );
    };

    /* =========================================================
    EDUCATION RECORDS (Modal + Add + Edit Summary)
    ========================================================= */
    const GRADE_OPTIONS = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    const HONOR_OPTIONS = [
    "None",
    "With Honors",
    "High Honors",
    "Magna Cum Laude (High Honors)",
    "Summa Cum Laude",
    "Outstanding Student",
    ];

    const EducationSummaryCard = ({ school, averageGrade, honor, onEdit }) => {
    const hasAvg = String(averageGrade ?? "").trim() !== "";
    return (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-5 md:p-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">School:</span>
            <span className="text-base text-gray-900 dark:text-gray-100">{school || "—"}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Average Grade:</span>
            {hasAvg ? (
                <span className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white">
                {Number(averageGrade).toFixed(1)}%
                </span>
            ) : (
                <span className="text-gray-600 dark:text-gray-400">—</span>
            )}
            </div>

            {honor && honor !== "None" ? (
            <div className="mt-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Award size={16} />
                <span className="text-sm">{honor}</span>
            </div>
            ) : null}
        </div>

        <button
            type="button"
            onClick={onEdit}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
        >
            <Pencil size={16} />
            Edit
        </button>
        </div>
    );
    };

    const SubjectCard = ({ subject, teacher, term, comments, grade }) => {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
            <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">{subject || "—"}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {teacher || "—"}
                {term ? <span className="mx-1">•</span> : null}
                {term || ""}
            </p>

            <p className="text-sm text-gray-800 dark:text-gray-200 mt-3 whitespace-pre-wrap">{comments || "—"}</p>
            </div>

            <div className="shrink-0">
            <span className="text-sm px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/30 text-gray-900 dark:text-gray-100">
                {grade || "—"}
            </span>
            </div>
        </div>
        </div>
    );
    };

    const EducationRecordsModal = ({
    childName,
    summary,
    subjects,
    onClose,
    onAddClick,
    onEditSummaryClick,
    loading,
    error,
    }) => {
    return (
        <ModalShell
        title={
            <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 flex items-center justify-center">
                <GraduationCap size={18} className="text-blue-600 dark:text-blue-400" />
            </span>
            <span>Education Records</span>
            </span>
        }
        subtitle={childName}
        onClose={onClose}
        maxWidth="max-w-4xl"
        >
        <div className="flex items-center justify-end mb-5">
            <Button type="button" variant="primary" size="medium" onClick={onAddClick} className="flex items-center gap-2">
            <Plus size={16} />
            Add Record
            </Button>
        </div>

        {loading ? (
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-200">
            Loading education records...
            </div>
        ) : error ? (
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
            {error}
            </div>
        ) : (
            <>
            <EducationSummaryCard
                school={summary?.school}
                averageGrade={summary?.averageGrade}
                honor={summary?.honor}
                onEdit={onEditSummaryClick}
            />

            <div className="my-6 border-t border-gray-200 dark:border-gray-800" />

            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject Details</h3>

            {subjects?.length ? (
                <div className="space-y-5">
                {subjects.map((s) => (
                    <SubjectCard
                    key={s.id}
                    subject={s.subject}
                    teacher={s.teacher}
                    term={s.term}
                    comments={s.comments}
                    grade={s.grade}
                    />
                ))}
                </div>
            ) : (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
                <p className="text-gray-900 dark:text-gray-100 font-semibold">No subject records yet</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click “Add Record” to add a subject.
                </p>
                </div>
            )}
            </>
        )}
        </ModalShell>
    );
    };

    const AddEducationRecordModal = ({ childName, onClose, onSubmit, saving, error }) => {
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState("");
    const [teacher, setTeacher] = useState("");
    const [term, setTerm] = useState("");
    const [comments, setComments] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
        subject: subject.trim(),
        grade,
        teacher: teacher.trim(),
        term: term.trim(),
        comments: comments.trim(),
        };
        if (!payload.subject || !payload.grade || !payload.teacher) return;
        onSubmit?.(payload);
    };

    return (
        <ModalShell title="Add Education Record" subtitle={null} onClose={onClose} maxWidth="max-w-2xl">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-gray-800 dark:text-gray-200 mb-6">
            Adding education record for: <span className="font-semibold">{childName}</span>
        </div>

        {error ? (
            <div className="mb-5 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
            {error}
            </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <FieldLabel>Subject *</FieldLabel>
            <TextInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, English, Science"
                required
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Grade *</FieldLabel>
            <SelectInput value={grade} onChange={(e) => setGrade(e.target.value)} required disabled={saving}>
                <option value="" disabled>
                Select grade
                </option>
                {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                    {g}
                </option>
                ))}
            </SelectInput>
            </div>

            <div>
            <FieldLabel>Teacher *</FieldLabel>
            <TextInput
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Teacher name"
                required
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Term/Quarter</FieldLabel>
            <TextInput
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g., Term 2 2025, Q1 2025"
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Comments/Observations</FieldLabel>
            <TextArea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Teacher comments or observations"
                disabled={saving}
            />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={saving}>
                Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" className="flex items-center gap-2" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Add Record"}
            </Button>
            </div>
        </form>
        </ModalShell>
    );
    };

    const EditEducationSummaryModal = ({ initial, onClose, onSubmit, saving, error }) => {
    const [school, setSchool] = useState(initial?.school || "");
    const [averageGrade, setAverageGrade] = useState(String(initial?.averageGrade ?? ""));
    const [honor, setHonor] = useState(initial?.honor || "None");

    useEffect(() => {
        setSchool(initial?.school || "");
        setAverageGrade(String(initial?.averageGrade ?? ""));
        setHonor(initial?.honor || "None");
    }, [initial]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const avg = averageGrade === "" ? "" : Number(averageGrade);
        if (averageGrade !== "" && Number.isNaN(avg)) return;

        onSubmit?.({
        school: school.trim(),
        averageGrade: averageGrade === "" ? "" : avg,
        honor,
        });
    };

    return (
        <ModalShell title="Edit Education Summary" subtitle={null} onClose={onClose} maxWidth="max-w-2xl">
        {error ? (
            <div className="mb-5 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
            {error}
            </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <FieldLabel>School</FieldLabel>
            <TextInput value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Grade 3" disabled={saving} />
            </div>

            <div>
            <FieldLabel>Average Grade (%)</FieldLabel>
            <TextInput
                type="number"
                step="0.1"
                value={averageGrade}
                onChange={(e) => setAverageGrade(e.target.value)}
                placeholder="91.8"
                disabled={saving}
            />
            </div>

            <div>
            <FieldLabel>Honor/Recognition</FieldLabel>
            <SelectInput value={honor} onChange={(e) => setHonor(e.target.value)} disabled={saving}>
                {HONOR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                    {h}
                </option>
                ))}
            </SelectInput>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={saving}>
                Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" className="flex items-center gap-2" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
            </Button>
            </div>
        </form>
        </ModalShell>
    );
    };

    /* ===========================
    ChildDetailModal (CONNECTED TO BACKEND)
    =========================== */
    const ChildDetailModal = ({ child, onClose, onEdit, onViewDevelopment }) => {
    const safeChild = useMemo(() => child || {}, [child]);

    const firstName = safeChild.firstName ?? safeChild.first_name ?? "";
    const middleName = safeChild.middleName ?? safeChild.middle_name ?? "";
    const lastName = safeChild.lastName ?? safeChild.last_name ?? "";
    const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();

    // API like Children.js
    const API_URL = "http://localhost:5000/api/children";
    const token = localStorage.getItem("admin_token");

    const jsonHeaders = useMemo(
        () => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        }),
        [token]
    );

    /* --------- Health state --------- */
    const initialHealthRecords = useMemo(() => {
        const list = safeChild.healthRecords ?? safeChild.health_records ?? [];
        return (Array.isArray(list) ? list : []).map((r, idx) => ({
        id: r.id ?? r._id ?? `${safeChild.id || "child"}-h-${idx}`,
        type: r.type ?? r.recordType ?? r.record_type ?? "",
        provider: r.provider ?? r.doctor ?? r.healthcareProvider ?? "",
        date: r.date ?? r.recordDate ?? r.record_date ?? "",
        notes: r.notes ?? r.findings ?? r.findings_notes ?? "",
        nextAppointment: r.nextAppointment ?? r.next_appointment ?? "",
        ...r,
        }));
    }, [safeChild]);

    const [healthRecords, setHealthRecords] = useState(initialHealthRecords);
    const [isHealthOpen, setIsHealthOpen] = useState(false);
    const [isHealthAddOpen, setIsHealthAddOpen] = useState(false);
    const [healthEditing, setHealthEditing] = useState(null);

    const [healthLoading, setHealthLoading] = useState(false);
    const [healthError, setHealthError] = useState("");
    const [healthSaving, setHealthSaving] = useState(false);

    useEffect(() => {
        setHealthRecords(initialHealthRecords);
    }, [initialHealthRecords]);

    const sortedHealthRecords = useMemo(() => {
        const toTime = (d) => {
        const iso = toDateInputValue(d);
        if (!iso) return 0;
        const t = new Date(iso).getTime();
        return Number.isNaN(t) ? 0 : t;
        };
        return [...healthRecords].sort((a, b) => toTime(b.date) - toTime(a.date));
    }, [healthRecords]);

    const fetchHealthRecords = async () => {
        if (!safeChild?.id) return;
        setHealthLoading(true);
        setHealthError("");
        try {
        const res = await fetch(`${API_URL}/${safeChild.id}/health-records`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to fetch health records");
        }

        const mapped = (data.records || []).map((r) => ({
            id: r.id,
            type: r.recordType || r.record_type || "",
            provider: r.provider || "",
            date: r.recordDate || r.record_date || "",
            notes: r.notes || "",
            nextAppointment: r.nextAppointment || r.next_appointment || "",
        }));

        setHealthRecords(mapped);
        } catch (e) {
        setHealthError(e.message || "Failed to fetch health records");
        } finally {
        setHealthLoading(false);
        }
    };

    const openHealthRecords = async () => {
        setIsHealthOpen(true);
        await fetchHealthRecords();
    };

    const closeHealthRecords = () => setIsHealthOpen(false);

    const handleAddHealth = async (payload) => {
        if (!safeChild?.id) return;
        setHealthSaving(true);
        setHealthError("");
        try {
        const res = await fetch(`${API_URL}/${safeChild.id}/health-records`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
            recordType: payload.type,
            provider: payload.provider,
            recordDate: payload.date,
            notes: payload.notes,
            nextAppointment: payload.nextAppointment || null,
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to add health record");
        }

        const r = data.record;
        const mapped = {
            id: r.id,
            type: r.recordType || "",
            provider: r.provider || "",
            date: r.recordDate || "",
            notes: r.notes || "",
            nextAppointment: r.nextAppointment || "",
        };

        setHealthRecords((prev) => [mapped, ...prev]);
        setIsHealthAddOpen(false);
        } catch (e) {
        setHealthError(e.message || "Failed to add health record");
        } finally {
        setHealthSaving(false);
        }
    };

    const handleEditHealth = async (payload) => {
        if (!payload?.id) return;
        setHealthSaving(true);
        setHealthError("");
        try {
        const res = await fetch(`${API_URL}/health-records/${payload.id}`, {
            method: "PUT",
            headers: jsonHeaders,
            body: JSON.stringify({
            recordType: payload.type,
            provider: payload.provider,
            recordDate: payload.date,
            notes: payload.notes,
            nextAppointment: payload.nextAppointment || null,
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to update health record");
        }

        const r = data.record;
        const mapped = {
            id: r.id,
            type: r.recordType || "",
            provider: r.provider || "",
            date: r.recordDate || "",
            notes: r.notes || "",
            nextAppointment: r.nextAppointment || "",
        };

        setHealthRecords((prev) => prev.map((x) => (x.id === mapped.id ? mapped : x)));
        setHealthEditing(null);
        } catch (e) {
        setHealthError(e.message || "Failed to update health record");
        } finally {
        setHealthSaving(false);
        }
    };

    /* --------- Education state --------- */
    const fallbackEducationSummary = useMemo(() => {
        const s =
        safeChild.educationSummary ??
        safeChild.education_summary ??
        {
            school: safeChild.educationLevel || "",
            averageGrade: "",
            honor: "None",
        };

        return {
        school: s.school ?? s.level ?? "",
        averageGrade: s.averageGrade ?? s.average_grade ?? "",
        honor: s.honor ?? s.recognition ?? "None",
        };
    }, [safeChild]);

    const fallbackEducationSubjects = useMemo(() => {
        const list = safeChild.educationRecords ?? safeChild.education_records ?? safeChild.subjects ?? [];
        return (Array.isArray(list) ? list : []).map((r, idx) => ({
        id: r.id ?? r._id ?? `${safeChild.id || "child"}-e-${idx}`,
        subject: r.subject ?? r.name ?? "",
        grade: r.grade ?? r.score ?? "",
        teacher: r.teacher ?? r.instructor ?? "",
        term: r.term ?? r.quarter ?? "",
        comments: r.comments ?? r.observations ?? "",
        ...r,
        }));
    }, [safeChild]);

    const [educationSummary, setEducationSummary] = useState(fallbackEducationSummary);
    const [educationSubjects, setEducationSubjects] = useState(fallbackEducationSubjects);

    const [isEducationOpen, setIsEducationOpen] = useState(false);
    const [isEduAddOpen, setIsEduAddOpen] = useState(false);
    const [isEduSummaryEditOpen, setIsEduSummaryEditOpen] = useState(false);

    const [eduLoading, setEduLoading] = useState(false);
    const [eduError, setEduError] = useState("");
    const [eduSaving, setEduSaving] = useState(false);

    useEffect(() => setEducationSummary(fallbackEducationSummary), [fallbackEducationSummary]);
    useEffect(() => setEducationSubjects(fallbackEducationSubjects), [fallbackEducationSubjects]);

    const fetchEducation = async () => {
        if (!safeChild?.id) return;
        setEduLoading(true);
        setEduError("");
        try {
        const res = await fetch(`${API_URL}/${safeChild.id}/education`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to fetch education records");
        }

        setEducationSummary(data.summary || { school: "", averageGrade: "", honor: "None" });
        setEducationSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        } catch (e) {
        setEduError(e.message || "Failed to fetch education records");
        } finally {
        setEduLoading(false);
        }
    };

    const openEducationRecords = async () => {
        setIsEducationOpen(true);
        await fetchEducation();
    };

    const closeEducationRecords = () => setIsEducationOpen(false);

    const handleAddEducationSubject = async (payload) => {
        if (!safeChild?.id) return;
        setEduSaving(true);
        setEduError("");
        try {
        const res = await fetch(`${API_URL}/${safeChild.id}/education-records`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to add education record");
        }

        // backend returns { record }
        const record = data.record;
        setEducationSubjects((prev) => [record, ...prev]);
        setIsEduAddOpen(false);
        } catch (e) {
        setEduError(e.message || "Failed to add education record");
        } finally {
        setEduSaving(false);
        }
    };

    const handleSaveEducationSummary = async (payload) => {
        if (!safeChild?.id) return;
        setEduSaving(true);
        setEduError("");
        try {
        const res = await fetch(`${API_URL}/${safeChild.id}/education-summary`, {
            method: "PUT",
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Failed to save education summary");
        }

        setEducationSummary(data.summary || payload);
        setIsEduSummaryEditOpen(false);
        } catch (e) {
        setEduError(e.message || "Failed to save education summary");
        } finally {
        setEduSaving(false);
        }
    };

    // safe early return AFTER hooks
    if (!child) return null;

    return (
        <>
        <ModalShell
            title={fullName}
            subtitle={`${safeChild.age} years old • ${safeChild.gender}`}
            onClose={onClose}
            maxWidth="max-w-3xl"
        >
            {/* Header chips */}
            <div className="flex items-start gap-4">
            <img
                src={safeChild.photoUrl || safeChild.image}
                alt={fullName}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-800"
            />

            <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                {safeChild.status && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(safeChild.status)}`}>
                    {safeChild.status}
                    </span>
                )}
                {safeChild.healthStatus && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${getHealthStatusColor(safeChild.healthStatus)}`}>
                    {safeChild.healthStatus}
                    </span>
                )}
                {safeChild.adoptionStatus && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${getAdoptionStatusColor(safeChild.adoptionStatus)}`}>
                    {safeChild.adoptionStatus}
                    </span>
                )}
                </div>
            </div>
            </div>

            {/* Body */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>

                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Admission Date: {safeChild.admissionDate || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>House: {safeChild.house || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>House Parent: {safeChild.houseParent || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Emergency: {safeChild.emergencyContact || "—"}</span>
                </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Health &amp; Education</h3>

                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <Heart size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Health Status: {safeChild.healthStatus || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Last Check-up: {safeChild.lastCheckup || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Education Level: {safeChild.educationLevel || "—"}</span>
                </div>
                </div>
            </div>
            </div>

            {/* Notes */}
            <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Notes</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                {safeChild.notes || "—"}
            </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
            <Button
                type="button"
                variant="primary"
                size="medium"
                onClick={() => onViewDevelopment?.(safeChild)}
                className="flex items-center gap-2"
            >
                <LineChart size={16} />
                View Development
            </Button>

            <Button type="button" variant="outline" size="medium" onClick={openHealthRecords} className="flex items-center gap-2">
                <Stethoscope size={16} />
                Health Records
            </Button>

            <Button type="button" variant="outline" size="medium" onClick={openEducationRecords} className="flex items-center gap-2">
                <GraduationCap size={16} />
                Education Records
            </Button>

            <Button
                type="button"
                variant="outline"
                size="medium"
                onClick={() => onEdit?.(safeChild)}
                className="flex items-center gap-2"
            >
                <Pencil size={16} />
                Edit Profile
            </Button>
            </div>
        </ModalShell>

        {/* ===================== HEALTH MODALS ===================== */}
        {isHealthOpen ? (
            <HealthRecordsModal
            childName={fullName}
            records={sortedHealthRecords}
            onClose={closeHealthRecords}
            onAddClick={() => {
                closeHealthRecords();
                setHealthError("");
                setIsHealthAddOpen(true);
            }}
            onEditClick={(record) => {
                closeHealthRecords();
                setHealthError("");
                setHealthEditing(record);
            }}
            loading={healthLoading}
            error={healthError}
            />
        ) : null}

        {isHealthAddOpen ? (
            <HealthRecordFormModal
            mode="add"
            childName={fullName}
            initial={{ type: "", provider: "", date: new Date(), notes: "", nextAppointment: "" }}
            onClose={() => setIsHealthAddOpen(false)}
            onSubmit={handleAddHealth}
            saving={healthSaving}
            error={healthError}
            />
        ) : null}

        {healthEditing ? (
            <HealthRecordFormModal
            mode="edit"
            childName={fullName}
            initial={healthEditing}
            onClose={() => setHealthEditing(null)}
            onSubmit={handleEditHealth}
            saving={healthSaving}
            error={healthError}
            />
        ) : null}

        {/* ===================== EDUCATION MODALS ===================== */}
        {isEducationOpen ? (
            <EducationRecordsModal
            childName={fullName}
            summary={educationSummary}
            subjects={educationSubjects}
            onClose={closeEducationRecords}
            onAddClick={() => {
                closeEducationRecords();
                setEduError("");
                setIsEduAddOpen(true);
            }}
            onEditSummaryClick={() => {
                closeEducationRecords();
                setEduError("");
                setIsEduSummaryEditOpen(true);
            }}
            loading={eduLoading}
            error={eduError}
            />
        ) : null}

        {isEduAddOpen ? (
            <AddEducationRecordModal
            childName={fullName}
            onClose={() => setIsEduAddOpen(false)}
            onSubmit={handleAddEducationSubject}
            saving={eduSaving}
            error={eduError}
            />
        ) : null}

        {isEduSummaryEditOpen ? (
            <EditEducationSummaryModal
            initial={educationSummary}
            onClose={() => setIsEduSummaryEditOpen(false)}
            onSubmit={handleSaveEducationSummary}
            saving={eduSaving}
            error={eduError}
            />
        ) : null}
        </>
    );
};

export default ChildDetailModal;
