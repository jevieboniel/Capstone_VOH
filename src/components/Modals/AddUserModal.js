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
    ACTION_BTN,
    }) => {
    if (!isOpen) return null;

    return (
        <div
        className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black/40 dark:bg-black/60
            px-3 sm:px-4 py-6
        "
        role="dialog"
        aria-modal="true"
        >
        {/* ✅ Panel */}
        <div
            className="
            w-full max-w-3xl
            bg-white dark:bg-gray-900
            rounded-2xl shadow-2xl
            border border-gray-200 dark:border-gray-800
            max-h-[90vh] overflow-hidden
            flex flex-col
            "
        >
            {/* ✅ Header (fixed) */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center shadow-md shrink-0">
                    <UserPlus className="h-4 w-4 text-white" />
                    </span>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    Add New User
                    </h2>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Create a new user account with appropriate role and permissions.
                </p>
                </div>

                <button onClick={onClose} className={ACTION_BTN} title="Close" type="button">
                <span className="text-xl leading-none text-gray-700 dark:text-gray-200">
                    ×
                </span>
                </button>
            </div>
            </div>

            {/* ✅ Body (scrolls) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-5">
                <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3">
                    {newUser.avatarUrl ? (
                    <img
                        src={newUser.avatarUrl}
                        alt="Preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-200 text-xl sm:text-2xl font-semibold border border-indigo-100 dark:border-indigo-900/40">
                        ?
                    </div>
                    )}

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full md:w-auto">
                        <span>Upload Photo</span>
                        <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        />
                    </label>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG or PNG, max ~2MB.
                    </p>
                    </div>
                </div>

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ... keep your inputs exactly the same ... */}
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

                    <div className="space-y-1.5 sm:col-span-2">
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
                        className="inline-flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200"
                    >
                        <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-900"
                        checked={newUser.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        />
                        <span className="break-words">{permission}</span>
                    </label>
                    ))}
                </div>
                </div>
            </div>
            </div>

            {/* ✅ Footer (always visible) */}
            <div
            className="
                p-5 sm:p-6 border-t border-gray-100 dark:border-gray-800
                bg-white/95 dark:bg-gray-900/95 backdrop-blur
            "
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
                </Button>

                <Button
                onClick={handleCreateUser}
                disabled={loading}
                loading={loading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                Create User
                </Button>
            </div>
            </div>
        </div>
        </div>
    );
};

export default AddUserModal;
