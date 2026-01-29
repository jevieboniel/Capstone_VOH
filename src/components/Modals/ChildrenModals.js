import React, { useState } from "react";
import {X} from "lucide-react";
import Button from "../UI/Button";
import EditProfileModal from "./EditProfileModal";
import ChildDetailModal from "./ChildDetailModal";
import ReintegrationModal from "./ReintegrationModal";

export { EditProfileModal, ChildDetailModal, ReintegrationModal };


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