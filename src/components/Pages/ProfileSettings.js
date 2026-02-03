    import React, { useEffect, useState } from "react";
    import { Camera, Save, X } from "lucide-react";
    import Button from "../UI/Button";

    /**
     * ✅ MATCHED sizing + alignment tokens from your Users page
     * - Same container: max-w-[1200px] + p-4 sm:p-6
     * - Same card style: rounded-2xl border bg + shadow-sm
     * - Same control height: h-11
     * - Same action icon button: h-10 w-10 rounded-xl
     */

    const CONTROL_H = "h-11"; // 44px (same as Users)
    const CONTROL =
    `${CONTROL_H} w-full rounded-xl border border-gray-300 dark:border-gray-700 ` +
    `bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-gray-100 ` +
    `placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`;

    const LABEL = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";
    const HELP = "text-xs text-gray-500 dark:text-gray-400 mt-1";

    const CARD =
    "rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm";
    const CARD_HOVER = "hover:shadow-md transition-shadow";

    const Card = ({ title, description, children, right }) => (
    <div className={`${CARD} ${CARD_HOVER}`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
        <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
            </h3>
            {description ? (
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {description}
            </p>
            ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
        </div>

        <div className="p-6">{children}</div>
    </div>
    );

    const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {desc ? <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{desc}</p> : null}
        </div>

        <button
        type="button"
        onClick={onChange}
        className={
            "relative inline-flex h-6 w-11 items-center rounded-full transition " +
            (checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700")
        }
        aria-pressed={checked}
        >
        <span
            className={
            "inline-block h-5 w-5 transform rounded-full bg-white transition " +
            (checked ? "translate-x-5" : "translate-x-1")
            }
        />
        </button>
    </div>
    );

    const ProfileSettings = ({
    initialUser = {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Staff",
        avatarUrl: "",
        notifications: { email: true, sms: false, system: true },
    },
    onSave, // async (payload) => {}
    onCancel, // () => {}
    roleReadOnly = true,
    }) => {
    // ✅ lazy init
    const [form, setForm] = useState(() => initialUser);
    const [loading, setLoading] = useState(false);

    // ✅ avatar preview
    const [avatarPreview, setAvatarPreview] = useState(() => initialUser.avatarUrl || "");

    // ✅ eslint exhaustive-deps fix
    useEffect(() => {
        setForm(initialUser);
        setAvatarPreview(initialUser.avatarUrl || "");
    }, [initialUser]);

    // ✅ cleanup blob URLs
    useEffect(() => {
        return () => {
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const setVal = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        setAvatarPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
        });

        setForm((prev) => ({
        ...prev,
        avatarFile: file,
        }));
    };

    const handleSave = async () => {
        try {
        setLoading(true);

        const payload = {
            ...form,
            avatarUrl: avatarPreview, // if you upload, replace with server URL
        };

        await onSave?.(payload);
        setLoading(false);
        } catch (err) {
        console.error(err);
        setLoading(false);
        alert("Failed to save changes.");
        }
    };

    const handleCancel = () => {
        setForm(initialUser);
        setAvatarPreview(initialUser.avatarUrl || "");
        onCancel?.();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* ✅ MATCHED container */}
        <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
            {/* HEADER (matched like Users page) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Profile Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update your personal information, password, and preferences
                </p>
            </div>

            {/* Header actions (same button height as Users page) */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                variant="outline"
                onClick={handleCancel}
                className={`w-full sm:w-auto px-5 ${CONTROL_H} rounded-xl`}
                >
                <span className="inline-flex items-center gap-2">
                    <X className="h-4 w-4" /> Cancel
                </span>
                </Button>

                <Button
                onClick={handleSave}
                loading={loading}
                className={`w-full sm:w-auto px-5 ${CONTROL_H} rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white`}
                >
                <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                </span>
                </Button>
            </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT */}
            <div className="lg:col-span-1 space-y-6">
                <Card title="Profile Photo" description="This will be shown on your account.">
                <div className="flex items-center gap-4">
                    {avatarPreview ? (
                    <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-200 text-xl font-semibold border border-indigo-100 dark:border-indigo-900/40">
                        ?
                    </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                    <label
                        className={`inline-flex items-center justify-center gap-2 px-4 ${CONTROL_H} rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full`}
                    >
                        <Camera className="h-4 w-4" />
                        <span>Upload Photo</span>
                        <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        />
                    </label>
                    <p className={HELP}>JPG or PNG, max ~2MB.</p>
                    </div>
                </div>
                </Card>

                <Card title="Account" description="Your account details.">
                <div>
                    <label className={LABEL}>Role</label>
                    <input
                    value={form.role || ""}
                    disabled={roleReadOnly}
                    onChange={(e) => setVal("role", e.target.value)}
                    className={`${CONTROL} ${roleReadOnly ? "opacity-80 cursor-not-allowed" : ""}`}
                    />
                    {roleReadOnly ? <p className={HELP}>Role is managed by the admin.</p> : null}
                </div>
                </Card>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2 space-y-6">
                <Card title="Personal Information" description="Make sure your details are correct.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className={LABEL}>
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.firstName || ""}
                        onChange={(e) => setVal("firstName", e.target.value)}
                        placeholder="Enter first name"
                        className={CONTROL}
                    />
                    </div>

                    <div>
                    <label className={LABEL}>
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.lastName || ""}
                        onChange={(e) => setVal("lastName", e.target.value)}
                        placeholder="Enter last name"
                        className={CONTROL}
                    />
                    </div>

                    <div>
                    <label className={LABEL}>Middle Name</label>
                    <input
                        value={form.middleName || ""}
                        onChange={(e) => setVal("middleName", e.target.value)}
                        placeholder="Enter middle name"
                        className={CONTROL}
                    />
                    </div>

                    <div>
                    <label className={LABEL}>
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={form.email || ""}
                        onChange={(e) => setVal("email", e.target.value)}
                        placeholder="Enter email address"
                        className={CONTROL}
                    />
                    </div>

                    <div className="sm:col-span-2">
                    <label className={LABEL}>Phone Number</label>
                    <input
                        value={form.phone || ""}
                        onChange={(e) => setVal("phone", e.target.value)}
                        placeholder="Enter phone number"
                        className={CONTROL}
                    />
                    </div>
                </div>
                </Card>

                <Card title="Change Password" description="Leave blank if you don’t want to change it.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                    <label className={LABEL}>Current Password</label>
                    <input
                        type="password"
                        value={form.currentPassword || ""}
                        onChange={(e) => setVal("currentPassword", e.target.value)}
                        placeholder="Enter current password"
                        className={CONTROL}
                    />
                    </div>

                    <div>
                    <label className={LABEL}>New Password</label>
                    <input
                        type="password"
                        value={form.newPassword || ""}
                        onChange={(e) => setVal("newPassword", e.target.value)}
                        placeholder="Enter new password"
                        className={CONTROL}
                    />
                    </div>

                    <div>
                    <label className={LABEL}>Confirm New Password</label>
                    <input
                        type="password"
                        value={form.confirmPassword || ""}
                        onChange={(e) => setVal("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        className={CONTROL}
                    />
                    </div>
                </div>
                </Card>

                <Card title="Notifications" description="Choose how you want to receive updates.">
                <div className="space-y-4">
                    <Toggle
                    checked={!!form.notifications?.email}
                    onChange={() =>
                        setForm((p) => ({
                        ...p,
                        notifications: { ...p.notifications, email: !p.notifications?.email },
                        }))
                    }
                    label="Email notifications"
                    desc="Receive updates via email."
                    />

                    <Toggle
                    checked={!!form.notifications?.sms}
                    onChange={() =>
                        setForm((p) => ({
                        ...p,
                        notifications: { ...p.notifications, sms: !p.notifications?.sms },
                        }))
                    }
                    label="SMS notifications"
                    desc="Receive text alerts (if phone number is set)."
                    />

                    <Toggle
                    checked={!!form.notifications?.system}
                    onChange={() =>
                        setForm((p) => ({
                        ...p,
                        notifications: { ...p.notifications, system: !p.notifications?.system },
                        }))
                    }
                    label="System notifications"
                    desc="Receive in-app notifications."
                    />
                </div>
                </Card>
            </div>
            </div>

            {/* ✅ Mobile sticky actions (matched sizing) */}
            <div
            className="lg:hidden fixed left-0 right-0 bottom-0 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 p-3 backdrop-blur"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
            >
            <div className="max-w-[1200px] mx-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-1">
                <Button
                variant="outline"
                onClick={handleCancel}
                className={`w-full sm:w-auto px-5 ${CONTROL_H} rounded-xl`}
                >
                Cancel
                </Button>
                <Button
                onClick={handleSave}
                loading={loading}
                className={`w-full sm:w-auto px-5 ${CONTROL_H} rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white`}
                >
                Save Changes
                </Button>
            </div>
            </div>

            {/* spacer */}
            <div className="lg:hidden h-24" />
        </div>
        </div>
    );
    };

    export default ProfileSettings;
