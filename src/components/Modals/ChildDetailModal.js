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
} from "lucide-react";
import Button from "../UI/Button";
import HealthRecordsModal from "./HealthRecordsModal";
import EducationRecordsModal from "./EducationRecordsModal";

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

/* ----------------- Dashboard-like Modal Shell ----------------- */
const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-3xl" }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-3 md:p-4">
      <div className={`w-full ${maxWidth} max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-300`}>
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

/* ===========================
ChildDetailModal
=========================== */
const ChildDetailModal = ({ child, onClose, onEdit, onViewDevelopment, onUpdateChild }) => {
  // hooks first
  const [showHealthRecords, setShowHealthRecords] = useState(false);
  const [healthRecords, setHealthRecords] = useState([]);

  const [showEducationRecords, setShowEducationRecords] = useState(false);
  const [educationSummary, setEducationSummary] = useState({ school: "", averageGrade: "", honor: "" });
  const [educationSubjects, setEducationSubjects] = useState([]);

  useEffect(() => {
    if (!child) return;

    setHealthRecords(Array.isArray(child.healthRecords) ? child.healthRecords : []);

    setEducationSummary({
      school: child.educationSummary?.school ?? child.education_summary?.school ?? child.educationLevel ?? "",
      averageGrade:
        child.educationSummary?.averageGrade ??
        child.educationSummary?.average_grade ??
        child.education_summary?.averageGrade ??
        child.education_summary?.average_grade ??
        "",
      honor:
        child.educationSummary?.honor ??
        child.educationSummary?.recognition ??
        child.education_summary?.honor ??
        child.education_summary?.recognition ??
        "",
    });

    setEducationSubjects(
      Array.isArray(child.educationSubjects)
        ? child.educationSubjects
        : Array.isArray(child.education_subjects)
        ? child.education_subjects
        : []
    );
  }, [child]);

  if (!child) return null;

  const firstName = child.firstName ?? child.first_name ?? "";
  const middleName = child.middleName ?? child.middle_name ?? "";
  const lastName = child.lastName ?? child.last_name ?? "";
  const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();

  // Health handlers
  const handleAddHealthRecord = (newRecord) => {
    setHealthRecords((prev) => [newRecord, ...prev]);
  };

  const handleUpdateHealthRecord = (index, updatedRecord) => {
    setHealthRecords((prev) => {
      const copy = [...prev];
      if (index < 0 || index >= copy.length) return prev;
      copy[index] = { ...copy[index], ...updatedRecord };
      return copy;
    });
  };

  // ✅ Education handlers (ALSO SAVE TO DB through onUpdateChild)
  const handleAddEducationSubject = (newSubject) => {
    setEducationSubjects((prev) => {
      const next = [newSubject, ...prev];

      const updatedChild = {
        ...child,
        educationSubjects: next,
        educationSummary: educationSummary,
      };

      onUpdateChild?.(updatedChild);
      return next;
    });
  };

  const handleUpdateEducationSummary = (newSummary) => {
    setEducationSummary((prev) => {
      const nextSummary = { ...prev, ...newSummary };

      // ✅ OPTIONAL: Use summary.school as the child.educationLevel shown on Children cards
      const updatedChild = {
        ...child,
        educationLevel: nextSummary.school || child.educationLevel,
        educationSummary: nextSummary,
        educationSubjects: educationSubjects,
      };

      onUpdateChild?.(updatedChild);
      return nextSummary;
    });
  };

  return (
    <>
      <ModalShell title={fullName} subtitle={`${child.age} years old • ${child.gender}`} onClose={onClose} maxWidth="max-w-3xl">
        {/* Header chips */}
        <div className="flex items-start gap-4">
          <img
            src={child.photoUrl || child.image}
            alt={fullName}
            className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-800"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                <span>Admission Date: {child.admissionDate || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                <span>House: {child.house || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400 dark:text-gray-500" />
                <span>House Parent: {child.houseParent || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                <span>Emergency: {child.emergencyContact || "—"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Health &amp; Education</h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-gray-400 dark:text-gray-500" />
                <span>Health Status: {child.healthStatus || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                <span>Last Check-up: {child.lastCheckup || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400 dark:text-gray-500" />
                <span>Education Level: {child.educationLevel || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Notes</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
            {child.notes || "—"}
          </div>
        </div>

        {/* Actions */}
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

          <Button
            type="button"
            variant="outline"
            size="medium"
            className="flex items-center gap-2"
            onClick={() => setShowHealthRecords(true)}
          >
            <Stethoscope size={16} />
            Health Records
          </Button>

          <Button
            type="button"
            variant="outline"
            size="medium"
            className="flex items-center gap-2"
            onClick={() => setShowEducationRecords(true)}
          >
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

      {/* Health Records */}
      {showHealthRecords && (
        <HealthRecordsModal
          child={child}
          records={healthRecords}
          onClose={() => setShowHealthRecords(false)}
          onAddRecord={handleAddHealthRecord}
          onUpdateRecord={handleUpdateHealthRecord}
        />
      )}

      {/* Education Records */}
      {showEducationRecords && (
        <EducationRecordsModal
          child={child}
          summary={educationSummary}
          subjects={educationSubjects}
          onClose={() => setShowEducationRecords(false)}
          onAddSubject={handleAddEducationSubject}
          onUpdateSummary={handleUpdateEducationSummary}
        />
      )}
    </>
  );
};

export default ChildDetailModal;
