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
  Home,
} from "lucide-react";
import Button from "../UI/Button";
import ReintegrationDetailsModal from "./ReintegrationDetailsModal";

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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            {subtitle ? <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p> : null}
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
        <Button type="button" variant="primary" size="medium" onClick={onAddClick} className="flex items-center gap-2">
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
   EDUCATION RECORDS (Modal + Add/Edit PER LEVEL)
   - ✅ Removed the old "Add Education Record" (subject details) modal
   - ✅ Subject details replaced with Education Records per level:
     educationLevel, school, finalAverage, honor/recognition
   ========================================================= */
const HONOR_OPTIONS = [
  "None",
  "With Honors",
  "High Honors",
  "Magna Cum Laude (High Honors)",
  "Summa Cum Laude",
  "Outstanding Student",
];

const EducationLevelCard = ({ record, onEdit }) => {
  const hasAvg = String(record?.finalAverage ?? "").trim() !== "";
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {record?.educationLevel || "Education Level"}
          </h4>

          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div className="flex flex-wrap gap-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">School:</span>
              <span>{record?.school || "—"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">Final Average:</span>
              {hasAvg ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-600 text-white">
                  {Number(record.finalAverage).toFixed(2)}%
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">—</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">Honor/Recognition:</span>
              {record?.honor && record.honor !== "None" ? (
                <span className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Award size={16} />
                  <span>{record.honor}</span>
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">None</span>
              )}
            </div>
          </div>
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
    </div>
  );
};

const EducationRecordsModal = ({
  childName,
  levels,
  onClose,
  onAddClick,
  onEditClick,
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
          Add Level Record
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
      ) : levels?.length ? (
        <div className="space-y-5">
          {levels.map((lvl) => (
            <EducationLevelCard key={lvl.id} record={lvl} onEdit={() => onEditClick?.(lvl)} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-gray-900 dark:text-gray-100 font-semibold">No education records yet</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click “Add Level Record” to create the first one.
          </p>
        </div>
      )}
    </ModalShell>
  );
};

const EducationLevelFormModal = ({ mode = "add", childName, initial, onClose, onSubmit, saving, error }) => {
  const [educationLevel, setEducationLevel] = useState(initial?.educationLevel || "");
  const [school, setSchool] = useState(initial?.school || "");
  const [finalAverage, setFinalAverage] = useState(String(initial?.finalAverage ?? ""));
  const [honor, setHonor] = useState(initial?.honor || "None");

  useEffect(() => {
    setEducationLevel(initial?.educationLevel || "");
    setSchool(initial?.school || "");
    setFinalAverage(String(initial?.finalAverage ?? ""));
    setHonor(initial?.honor || "None");
  }, [initial]);

  const title = mode === "edit" ? "Edit Education Record" : "Add Education Record";

  const handleSubmit = (e) => {
    e.preventDefault();
    const avg = finalAverage === "" ? "" : Number(finalAverage);
    if (finalAverage !== "" && Number.isNaN(avg)) return;

    onSubmit?.({
      ...initial,
      educationLevel: educationLevel.trim(),
      school: school.trim(),
      finalAverage: finalAverage === "" ? "" : avg,
      honor,
    });
  };

  return (
    <ModalShell title={title} subtitle={null} onClose={onClose} maxWidth="max-w-2xl">
      {mode === "add" ? (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-gray-800 dark:text-gray-200 mb-6">
          Adding education record for: <span className="font-semibold">{childName}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ NEW FIELD */}
        <div>
          <FieldLabel>Education Level *</FieldLabel>
          <TextInput
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            placeholder="e.g., Grade 6, Junior High, Senior High, College"
            required
            disabled={saving}
          />
        </div>

        <div>
          <FieldLabel>School *</FieldLabel>
          <TextInput
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="School name"
            required
            disabled={saving}
          />
        </div>

        <div>
          <FieldLabel>Final Average (%)</FieldLabel>
          <TextInput
            type="number"
            step="0.01"
            value={finalAverage}
            onChange={(e) => setFinalAverage(e.target.value)}
            placeholder="e.g., 91.00"
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
            {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Record"}
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

  const [showReintegrationDetails, setShowReintegrationDetails] = useState(false);

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

  /* --------- Education state (PER LEVEL) --------- */
  const fallbackEducationLevels = useMemo(() => {
    // If you don’t have backend "levels" yet, we create 1 level record from existing fields.
    const summary =
      safeChild.educationSummary ??
      safeChild.education_summary ??
      {
        school: "",
        averageGrade: "",
        honor: "None",
      };

    const school = summary.school ?? summary.level ?? safeChild.school ?? "";
    const avg = summary.averageGrade ?? summary.average_grade ?? "";
    const honor = summary.honor ?? summary.recognition ?? "None";
    const level = safeChild.educationLevel || summary.educationLevel || summary.education_level || "";

    return [
      {
        id: "summary", // special local id
        educationLevel: level || "—",
        school: school || "",
        finalAverage: avg === "" ? "" : avg,
        honor: honor || "None",
      },
    ];
  }, [safeChild]);

  const [educationLevels, setEducationLevels] = useState(fallbackEducationLevels);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

  // ✅ Only one modal now for add/edit education level records
  const [isEduLevelFormOpen, setIsEduLevelFormOpen] = useState(false);
  const [eduEditingLevel, setEduEditingLevel] = useState(null);

  const [eduLoading, setEduLoading] = useState(false);
  const [eduError, setEduError] = useState("");
  const [eduSaving, setEduSaving] = useState(false);

  useEffect(() => setEducationLevels(fallbackEducationLevels), [fallbackEducationLevels]);

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

      // Prefer new backend shape: { levels: [...] }
      if (Array.isArray(data.levels)) {
        setEducationLevels(
          data.levels.map((r, idx) => ({
            id: r.id ?? r._id ?? `${safeChild.id}-lvl-${idx}`,
            educationLevel: r.educationLevel ?? r.education_level ?? "",
            school: r.school ?? "",
            finalAverage: r.finalAverage ?? r.final_average ?? "",
            honor: r.honor ?? r.recognition ?? "None",
          }))
        );
        return;
      }

      // Fallback to old backend shape: { summary: {...} }
      const s = data.summary || {};
      setEducationLevels([
        {
          id: "summary",
          educationLevel: s.educationLevel ?? s.education_level ?? safeChild.educationLevel ?? "",
          school: s.school ?? "",
          finalAverage: s.averageGrade ?? s.average_grade ?? s.finalAverage ?? s.final_average ?? "",
          honor: s.honor ?? s.recognition ?? "None",
        },
      ]);
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

  const handleUpsertEducationLevel = async (payload) => {
    if (!safeChild?.id) return;
    setEduSaving(true);
    setEduError("");

    // Normalize payload for backend
    const body = {
      educationLevel: payload.educationLevel,
      school: payload.school,
      finalAverage: payload.finalAverage,
      honor: payload.honor,
    };

    try {
      // If you have NEW endpoints, this will work:
      // POST   /api/children/:id/education-levels
      // PUT    /api/children/education-levels/:levelId
      // If not available yet, we fallback to old /education-summary for the "summary" record.
      let res;
      let data;

      const isEdit = !!payload?.id && payload.id !== "summary";

      if (isEdit) {
        res = await fetch(`${API_URL}/education-levels/${payload.id}`, {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify(body),
        });
        data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to update education level");
        const rec = data.level || data.record || body;
        setEducationLevels((prev) =>
          prev.map((x) =>
            x.id === payload.id
              ? {
                  ...x,
                  educationLevel: rec.educationLevel ?? rec.education_level ?? body.educationLevel,
                  school: rec.school ?? body.school,
                  finalAverage: rec.finalAverage ?? rec.final_average ?? body.finalAverage,
                  honor: rec.honor ?? rec.recognition ?? body.honor,
                }
              : x
          )
        );
      } else {
        // Add mode
        res = await fetch(`${API_URL}/${safeChild.id}/education-levels`, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify(body),
        });

        // If backend does not have /education-levels, fallback to old /education-summary
        if (res.status === 404 || res.status === 405) {
          res = await fetch(`${API_URL}/${safeChild.id}/education-summary`, {
            method: "PUT",
            headers: jsonHeaders,
            body: JSON.stringify({
              school: body.school,
              // old field name
              averageGrade: body.finalAverage,
              honor: body.honor,
              // try to store education level too if backend supports extra column
              educationLevel: body.educationLevel,
            }),
          });
        }

        data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to save education record");

        const rec = data.level || data.summary || data.record || body;

        // If using old endpoint, just update the single "summary" record
        if (data.summary || payload.id === "summary") {
          setEducationLevels((prev) => [
            {
              id: "summary",
              educationLevel: rec.educationLevel ?? rec.education_level ?? body.educationLevel,
              school: rec.school ?? body.school,
              finalAverage:
                rec.finalAverage ??
                rec.final_average ??
                rec.averageGrade ??
                rec.average_grade ??
                body.finalAverage,
              honor: rec.honor ?? rec.recognition ?? body.honor,
            },
          ]);
        } else {
          // New endpoint create returns a new id
          setEducationLevels((prev) => [
            {
              id: rec.id ?? rec._id ?? `${safeChild.id}-lvl-${Date.now()}`,
              educationLevel: rec.educationLevel ?? rec.education_level ?? body.educationLevel,
              school: rec.school ?? body.school,
              finalAverage: rec.finalAverage ?? rec.final_average ?? body.finalAverage,
              honor: rec.honor ?? rec.recognition ?? body.honor,
            },
            ...prev,
          ]);
        }
      }

      setIsEduLevelFormOpen(false);
      setEduEditingLevel(null);
    } catch (e) {
      setEduError(e.message || "Failed to save education record");
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
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${getHealthStatusColor(safeChild.healthStatus)}`}
                >
                  {safeChild.healthStatus}
                </span>
              )}
              {safeChild.adoptionStatus && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${getAdoptionStatusColor(safeChild.adoptionStatus)}`}
                >
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

          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={openHealthRecords}
            className="flex items-center gap-2"
          >
            <Stethoscope size={16} />
            Health Records
          </Button>

          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={openEducationRecords}
            className="flex items-center gap-2"
          >
            <GraduationCap size={16} />
            Education Records
          </Button>

          {(safeChild.status === "Reintegrated" || !!safeChild.reintegration) && (
            <Button
              type="button"
              variant="outline"
              size="medium"
              onClick={() => setShowReintegrationDetails(true)}
              className="flex items-center gap-2 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <Home size={16} />
              View Reintegration Details
            </Button>
          )}

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

      {/* Reintegration Details Modal */}
      {showReintegrationDetails && (
        <ReintegrationDetailsModal child={safeChild} onClose={() => setShowReintegrationDetails(false)} />
      )}

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

      {/* ===================== EDUCATION MODALS (UPDATED) ===================== */}
      {isEducationOpen ? (
        <EducationRecordsModal
          childName={fullName}
          levels={educationLevels}
          onClose={closeEducationRecords}
          onAddClick={() => {
            closeEducationRecords();
            setEduError("");
            setEduEditingLevel(null);
            setIsEduLevelFormOpen(true);
          }}
          onEditClick={(level) => {
            closeEducationRecords();
            setEduError("");
            setEduEditingLevel(level);
            setIsEduLevelFormOpen(true);
          }}
          loading={eduLoading}
          error={eduError}
        />
      ) : null}

      {isEduLevelFormOpen ? (
        <EducationLevelFormModal
          mode={eduEditingLevel ? "edit" : "add"}
          childName={fullName}
          initial={
            eduEditingLevel || {
              id: null,
              educationLevel: safeChild.educationLevel || "",
              school: "",
              finalAverage: "",
              honor: "None",
            }
          }
          onClose={() => {
            setIsEduLevelFormOpen(false);
            setEduEditingLevel(null);
          }}
          onSubmit={handleUpsertEducationLevel}
          saving={eduSaving}
          error={eduError}
        />
      ) : null}
    </>
  );
};

export default ChildDetailModal;