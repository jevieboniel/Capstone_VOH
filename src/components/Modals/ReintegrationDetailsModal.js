import React from "react";
import { X, Home, User, Phone, Mail, MapPin, Calendar, FileText, BadgeCheck } from "lucide-react";
import Button from "../UI/Button";

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="mt-0.5 text-gray-400 dark:text-gray-500">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{value || "—"}</p>
    </div>
  </div>
);

const ReintegrationDetailsModal = ({ child, onClose }) => {
  if (!child) return null;

  const reintegration = child.reintegration || null;

  const firstName = child.firstName ?? child.first_name ?? "";
  const middleName = child.middleName ?? child.middle_name ?? "";
  const lastName = child.lastName ?? child.last_name ?? "";
  const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 md:px-6 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Reintegration Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {fullName} • Status: {child.status || "—"}
            </p>
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
        <div className="px-5 md:px-6 py-6 overflow-y-auto space-y-6">
          {!reintegration ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-6 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-200">No reintegration record found.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-green-50 dark:bg-green-950/25 border border-green-100 dark:border-green-900 p-5">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                  <Home size={18} />
                  Reintegration Record
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  Saved record of adoption/reintegration details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <Row icon={User} label="Adoptive Parents" value={reintegration.adoptiveParents} />
                <Row icon={BadgeCheck} label="Relationship" value={reintegration.relationship} />
                <Row icon={Phone} label="Contact Number" value={reintegration.contactNumber} />
                <Row icon={Mail} label="Email" value={reintegration.email} />
                <div className="md:col-span-2">
                  <Row icon={MapPin} label="Home Address" value={reintegration.homeAddress} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <Row icon={Calendar} label="Reintegration Date" value={reintegration.reintegrationDate} />
                <Row icon={Calendar} label="Follow-up Schedule" value={reintegration.followUpSchedule} />
                <Row icon={BadgeCheck} label="Home Study Status" value={reintegration.homeStudyStatus} />
                <Row icon={BadgeCheck} label="Legal Status" value={reintegration.legalStatus} />
                <Row icon={User} label="Assigned Social Worker" value={reintegration.socialWorker} />
                <Row icon={FileText} label="Court Order Number" value={reintegration.courtOrderNumber} />
                <div className="md:col-span-2">
                  <Row icon={FileText} label="Additional Notes" value={reintegration.additionalNotes} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <Row icon={Calendar} label="Created At" value={reintegration.createdAt} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 md:px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReintegrationDetailsModal;
