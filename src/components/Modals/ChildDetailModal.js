// src/components/Modals/ChildDetailModal.js
import React from "react";
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

    /* ===========================
    ChildDetailModal
    =========================== */
    const ChildDetailModal = ({ child, onClose, onEdit, onViewDevelopment }) => {
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

export default ChildDetailModal;
