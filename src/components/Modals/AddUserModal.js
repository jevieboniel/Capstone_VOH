import React from "react";
import { UserPlus } from "lucide-react";
import Button from "../UI/Button";

const AddUserModal = ({
    isOpen,
    onClose,
    newUser,
    setNewUser,
    availablePermissions,
    togglePermission,
    handleAvatarChange,
    handleCreateUser,
    loading,
    CONTROL,
    CONTROL_H,
    ACTION_BTN,
    }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-7 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 gap-4">
            <div>
                <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center shadow-md">
                    <UserPlus className="h-4 w-4 text-white" />
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add New User
                </h2>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Create a new user account with appropriate role and permissions.
                </p>
            </div>

            <button onClick={onClose} className={ACTION_BTN} title="Close">
                <span className="text-xl leading-none text-gray-700 dark:text-gray-200">
                ×
                </span>
            </button>
            </div>

            {/* Body */}
            <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar upload */}
                <div className="flex flex-col items-center md:items-start gap-3">
                {newUser.avatarUrl ? (
                    <img
                    src={newUser.avatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-200 text-2xl font-semibold border border-indigo-100 dark:border-indigo-900/40">
                    ?
                    </div>
                )}

                <label className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span>Upload Photo</span>
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    />
                </label>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
                    JPG or PNG, max ~2MB.
                </p>
                </div>

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    className={CONTROL}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    className={CONTROL}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Middle Name
                    </label>
                    <input
                    type="text"
                    placeholder="Enter middle name"
                    value={newUser.middleName}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, middleName: e.target.value }))
                    }
                    className={CONTROL}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={CONTROL}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Phone Number
                    </label>
                    <input
                    type="text"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className={CONTROL}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Role <span className="text-red-500">*</span>
                    </label>
                    <select
                    value={newUser.role}
                    onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className={CONTROL}
                    >
                    <option value="">Select role</option>
                    <option value="Staff">Staff</option>
                    <option value="Social Worker">Social Worker</option>
                    <option value="House Parent">House Parent</option>
                    <option value="Admin">Admin</option>
                    </select>
                </div>
                </div>
            </div>

            {/* Permissions */}
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Permissions{" "}
                <span className="font-normal text-gray-600 dark:text-gray-400">
                    (Optional - defaults will be applied based on role)
                </span>
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availablePermissions.map((permission) => (
                    <label
                    key={permission}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                    >
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-900"
                        checked={newUser.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                    />
                    {permission}
                    </label>
                ))}
                </div>
            </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
                Cancel
            </Button>

            <Button
                onClick={handleCreateUser}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                {loading ? "Creating..." : "Create User"}
            </Button>
            </div>
        </div>
        </div>
    );
};

export default AddUserModal;
