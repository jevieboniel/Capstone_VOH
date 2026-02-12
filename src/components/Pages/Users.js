// src/components/Pages/Users.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Phone,
  MoreVertical,
  Eye,
  Key,
  Ban,
  CheckCircle,
  Clock,
  X,
  Camera,
} from "lucide-react";

import Button from "../UI/Button";
import ConfirmationModal from "../UI/ConfirmationModal";
import AddUserModal from "../Modals/AddUserModal";

import { useAuth } from "../../contexts/AuthContext";
import { splitName, joinName } from "../../utils/name";
import { apiUrl } from "../../config/api";

// ----- PERMISSIONS SETUP -----
const availablePermissions = [
  "Child Management",
  "Development Tracking",
  "Donations",
  "Reports",
  "User Management",
  "Settings",
];

const rolePermissions = {
  Admin: ["Full Access"],
  Staff: ["Child Management", "Reports", "Donations", "Development Tracking"],
  "Social Worker": ["Child Management", "Development Tracking", "Reports"],
  "House Parent": ["Child Management", "Development Tracking"],
};

// ====== helpers: avatar url fix (so /uploads works) ======
const API_ORIGIN = (() => {
  // apiUrl("/api") => "http://localhost:5000/api"
  // we want origin => "http://localhost:5000"
  const full = apiUrl("/api");
  return full.replace(/\/api\/?$/, "");
})();

const toAbsoluteAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
};

// ✅ Permission gate helper (frontend)
const hasPermission = (user, perm) => {
  const perms = Array.isArray(user?.permissions) ? user.permissions : [];
  if (perms.includes("Full Access")) return true;
  if (!perm) return true;
  return perms.includes(perm);
};

// ----- HELPERS -----
const getRoleBadgeClasses = (role) => {
  switch (role) {
    case "Admin":
      return "bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/50";
    case "Staff":
      return "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900/50";
    case "Social Worker":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900/50";
    case "House Parent":
      return "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-900/50";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
  }
};

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900/50";
    case "Inactive":
      return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    case "Suspended":
      return "bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/50";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
  }
};

const formatLastLogin = (iso) => {
  if (!iso) return "Never";
  const now = new Date();
  const last = new Date(iso);
  const diffMs = now.getTime() - last.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return last.toLocaleDateString();
};

const formatDateShort = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return String(iso);
  }
};

// ======================= SMALL UI PRIMITIVE MODAL =======================
const BaseModal = ({ isOpen, title, subtitle, onClose, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="
            w-full sm:max-w-2xl
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            shadow-2xl overflow-hidden flex flex-col
            h-[95vh] sm:h-auto
            sm:rounded-2xl rounded-t-2xl
          "
        >
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center justify-center shrink-0"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

          {footer ? (
            <div
              className="
                border-t border-gray-100 dark:border-gray-800
                bg-white/95 dark:bg-gray-900/95 backdrop-blur
                p-4 sm:p-6 sticky bottom-0
              "
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ======================= VIEW DETAILS MODAL =======================
const UserDetailsModal = ({ isOpen, user, onClose, onEdit }) => {
  if (!isOpen || !user) return null;

  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`
    .replace(/\s+/g, " ")
    .trim();
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const avatar = toAbsoluteAvatarUrl(user.avatarUrl || "");

  return (
    <BaseModal
      isOpen={isOpen}
      title="User Details"
      subtitle="Complete information for this user account."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-5 h-11 rounded-xl">
            Close
          </Button>
          <Button
            onClick={() => onEdit?.(user)}
            className="px-5 h-11 rounded-xl bg-gray-900 hover:bg-black text-white inline-flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={fullName}
            className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold">
            {initials || "?"}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{fullName}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClasses(
                user.role
              )}`}
            >
              {String(user.role || "").toLowerCase()}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                user.status
              )}`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div>
            <span className="font-medium">Email:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div>
            <span className="font-medium">Phone:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">{user.phone || "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div>
            <span className="font-medium">Joined:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">{formatDateShort(user.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div>
            <span className="font-medium">Last Login:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">{formatDateShort(user.lastLogin)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Shield className="h-4 w-4" />
          Permissions
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(user.permissions && user.permissions.length > 0 ? user.permissions : ["—"]).map((p) => (
            <span
              key={p}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};

// ======================= EDIT USER MODAL =======================
const EditUserModal = ({ isOpen, user, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      id: user.id,
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "Staff",
      status: user.status || "Active",
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      avatarUrl: user.avatarUrl || "",
    });

    setAvatarFile(null);
    setAvatarPreview(toAbsoluteAvatarUrl(user.avatarUrl || ""));
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!isOpen || !user || !form) return null;

  const CONTROL =
    "h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const LABEL = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";

  const togglePerm = (perm) => {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter((x) => x !== perm)
        : [...p.permissions, perm],
    }));
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      alert("First Name, Last Name, and Email Address are required.");
      return;
    }

    const finalPerms = form.role === "Admin" ? ["Full Access"] : form.permissions;
    onSubmit?.({ ...form, permissions: finalPerms, avatarFile });
  };

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <BaseModal
      isOpen={isOpen}
      title="Edit User"
      subtitle="Update user information, role, and permissions."
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto px-5 h-11 rounded-xl">
            Cancel
          </Button>

          <Button
            onClick={submit}
            loading={loading}
            className="w-full sm:w-auto px-6 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Update User
          </Button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200">
            {initials}
          </div>
        )}

        <label className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 w-full sm:w-auto">
          <Camera className="h-4 w-4" />
          Upload Photo
          <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>First Name *</label>
          <input
            className={CONTROL}
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          />
        </div>

        <div>
          <label className={LABEL}>Middle Name</label>
          <input
            className={CONTROL}
            value={form.middleName}
            onChange={(e) => setForm((p) => ({ ...p, middleName: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL}>Last Name *</label>
          <input
            className={CONTROL}
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          />
        </div>

        <div>
          <label className={LABEL}>Email Address *</label>
          <input
            className={CONTROL}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div>
          <label className={LABEL}>Phone Number</label>
          <input
            className={CONTROL}
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <div>
          <label className={LABEL}>Role *</label>
          <select
            className={CONTROL}
            value={form.role}
            onChange={(e) => {
              const role = e.target.value;
              setForm((p) => ({
                ...p,
                role,
                permissions: role === "Admin" ? ["Full Access"] : rolePermissions[role] || p.permissions || [],
              }));
            }}
          >
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="Social Worker">Social Worker</option>
            <option value="House Parent">House Parent</option>
          </select>
        </div>

        <div>
          <label className={LABEL}>Status</label>
          <select
            className={CONTROL}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Permissions</div>

        {form.role === "Admin" ? (
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              Full Access
            </span>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availablePermissions.map((perm) => (
              <label key={perm} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={form.permissions.includes(perm)}
                  onChange={() => togglePerm(perm)}
                />
                {perm}
              </label>
            ))}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

// ----- USER CARD COMPONENT -----
const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onResetPassword, onViewDetails }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`.replace(/\s+/g, " ").trim();
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const hasAvatar = !!user.avatarUrl;
  const avatar = toAbsoluteAvatarUrl(user.avatarUrl || "");

  const handleMenuItem = (cb) => {
    setMenuOpen(false);
    cb && cb(user);
  };

  const ACTION_BTN =
    "h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 " +
    "inline-flex items-center justify-center transition-colors";

  return (
    <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {hasAvatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-semibold text-lg border border-indigo-100 dark:border-indigo-900/40">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                {user.role}
              </span>

              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(user.status)}`}>
                {user.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Joined: {user.createdAt || "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <span>Last login: {formatLastLogin(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 relative shrink-0">
          <button type="button" onClick={() => onEdit(user)} className={ACTION_BTN} title="Edit">
            <Edit className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          </button>

          <button type="button" onClick={() => setMenuOpen((o) => !o)} className={ACTION_BTN} title="More">
            <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 text-sm z-10 overflow-hidden">
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-left"
                onClick={() => handleMenuItem(onViewDetails)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-left"
                onClick={() => handleMenuItem(onEdit)}
              >
                <Edit className="h-4 w-4" />
                Edit User
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-left"
                onClick={() => handleMenuItem(onResetPassword)}
              >
                <Key className="h-4 w-4" />
                Reset Password
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              <button
                className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left ${
                  user.status === "Active"
                    ? "text-orange-600 dark:text-orange-300"
                    : "text-emerald-600 dark:text-emerald-300"
                }`}
                onClick={() => handleMenuItem(onToggleStatus)}
              >
                {user.status === "Active" ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Suspend User
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Activate User
                  </>
                )}
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-300 text-left"
                onClick={() => handleMenuItem(onDelete)}
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>

      {user.permissions && user.permissions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ======================= MAIN COMPONENT =======================
const Users = () => {
  const { authFetch, user: currentUser } = useAuth();

  // ✅ compute access AFTER hooks (no conditional hooks)
  const canAccess = hasPermission(currentUser, "User Management");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    permissions: [],
    avatarUrl: "",
    avatarFile: null,
    password: "",
  });

  const CONTROL_H = "h-11";
  const CONTROL =
    `${CONTROL_H} w-full rounded-xl border border-gray-300 dark:border-gray-700 ` +
    `bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-gray-100 ` +
    `placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`;
  const CARD =
    "rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm";
  const CARD_HOVER = "hover:shadow-md transition-shadow";
  const ACTION_BTN =
    "h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 " +
    "hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center justify-center transition-colors";

  /* =========================
     LOAD USERS FROM BACKEND
  ========================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await authFetch("/users");
      const data = await res.json();

      const rows = Array.isArray(data) ? data : data.users || [];

      const mapped = rows.map((u) => {
        const parts = splitName(u.name || "");
        const perms = Array.isArray(u.permissions)
          ? u.permissions
          : (() => {
              try {
                return u.permissions ? JSON.parse(u.permissions) : [];
              } catch {
                return [];
              }
            })();

        return {
          id: u.id,
          ...parts,
          email: u.email,
          role: u.role,
          status: u.status || "Active",
          phone: u.phone || "",
          avatarUrl: toAbsoluteAvatarUrl(u.avatarUrl || u.avatar_url || ""),
          permissions: perms,
          createdAt: u.createdAt || u.created_at || "",
          lastLogin: u.lastLogin || u.last_login || null,
        };
      });

      setUsers(mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ only fetch if allowed (still not conditional hook)
    if (!canAccess) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  // ------- FILTERING -------
  useEffect(() => {
    const q = searchTerm.toLowerCase();

    const filtered = users.filter((u) => {
      const fullName = `${u.firstName} ${u.middleName} ${u.lastName}`.replace(/\s+/g, " ").trim().toLowerCase();

      const matchesSearch =
        fullName.includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);

      const matchesRole = selectedRole === "All" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "All" || u.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, selectedRole, selectedStatus]);

  // ------- PAGINATION -------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = useMemo(
    () => filteredUsers.slice(indexOfFirstItem, indexOfLastItem),
    [filteredUsers, indexOfFirstItem, indexOfLastItem]
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  /* =========================
     ACTIONS (BACKEND)
  ========================= */

  // ✅ FormData-safe request (authFetch often forces JSON headers)
  const authFormFetch = async (path, formData, method = "POST") => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch(apiUrl(`/api${path}`), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return res;
  };

  const handleEditSubmit = async (formData) => {
    try {
      setLoading(true);

      const payloadName = joinName({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
      });

      const perms = formData.role === "Admin" ? ["Full Access"] : formData.permissions;

      const updateBase = {
        name: payloadName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone,
        permissions: perms,
      };

      if (formData.avatarFile instanceof File) {
        const fd = new FormData();
        Object.entries(updateBase).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") fd.append(k, JSON.stringify(v));
          else fd.append(k, v);
        });
        fd.append("avatar", formData.avatarFile);

        const res = await authFormFetch(`/users/${formData.id}`, fd, "PUT");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to update user.");
      } else {
        const res = await authFetch(`/users/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(updateBase),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to update user.");
      }

      await fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await authFetch(`/users/${selectedUser.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete user.");

      await fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      const res = await authFetch(`/users/${user.id}/toggle-status`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (user) => alert(`Password reset email would be sent to ${user.email}`);

  const openEditModal = (u) => {
    setSelectedUser(u);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (u) => {
    setSelectedUser(u);
    setIsDetailsModalOpen(true);
  };

  const togglePermission = (permission) => {
    setNewUser((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setNewUser((prev) => {
      if (prev.avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(prev.avatarUrl);
      return { ...prev, avatarUrl: url, avatarFile: file };
    });
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim() || !newUser.role) {
      alert("Please fill in all required fields (First Name, Last Name, Email, Role).");
      return;
    }

    if (!newUser.password.trim()) {
      alert("Please enter a password for the new user.");
      return;
    }

    try {
      setLoading(true);

      const perms = newUser.role === "Admin" ? ["Full Access"] : newUser.permissions || [];
      const hasAvatar = newUser.avatarFile instanceof File;

      let res;

      if (hasAvatar) {
        const fd = new FormData();
        fd.append("name", joinName(newUser));
        fd.append("email", newUser.email.trim());
        fd.append("role", newUser.role);
        fd.append("password", newUser.password.trim());
        fd.append("phone", newUser.phone || "");
        fd.append("status", "Active");
        fd.append("permissions", JSON.stringify(perms));
        fd.append("avatar", newUser.avatarFile);

        res = await authFormFetch("/users", fd, "POST");
      } else {
        const payload = {
          name: joinName(newUser),
          email: newUser.email.trim(),
          role: newUser.role,
          password: newUser.password.trim(),
          phone: newUser.phone || "",
          status: "Active",
          permissions: perms,
        };

        res = await authFetch("/users", { method: "POST", body: JSON.stringify(payload) });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      await fetchUsers();

      setIsAddModalOpen(false);
      setNewUser({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        permissions: [],
        avatarUrl: "",
        avatarFile: null,
        password: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create user. (Email may already exist)");
    } finally {
      setLoading(false);
    }
  };

  // ------- STATS -------
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveSuspended = users.filter((u) => u.status !== "Active").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;

  // ✅ ACCESS DENIED UI (NO early return)
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-gray-700 dark:text-gray-200" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">Access denied</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You don’t have permission to access <b>User Management</b>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage system users, roles, and permissions</p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className={`inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto px-5 ${CONTROL_H} rounded-xl shadow-sm`}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${CARD} ${CARD_HOVER} p-6 border-l-4 border-l-indigo-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-md">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`${CARD} ${CARD_HOVER} p-6 border-l-4 border-l-emerald-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{activeUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-md">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`${CARD} ${CARD_HOVER} p-6 border-l-4 border-l-slate-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inactive/Suspended</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{inactiveSuspended}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-3 rounded-2xl shadow-md">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`${CARD} ${CARD_HOVER} p-6 border-l-4 border-l-red-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admins</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{adminCount}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-2xl shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className={`${CARD} p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${CONTROL} pl-12 pr-4`}
              />
            </div>

            <select className={CONTROL} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Social Worker">Social Worker</option>
              <option value="House Parent">House Parent</option>
            </select>

            <select className={CONTROL} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* USER CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {currentUsers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onToggleStatus={handleToggleStatus}
              onResetPassword={() => handleResetPassword(u)}
              onViewDetails={openDetailsModal}
            />
          ))}

          {currentUsers.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center text-gray-600 dark:text-gray-400 shadow-sm">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className={`${CARD} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="small" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="small"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="small"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ADD USER MODAL */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          newUser={newUser}
          setNewUser={setNewUser}
          availablePermissions={availablePermissions}
          togglePermission={togglePermission}
          handleAvatarChange={handleAvatarChange}
          handleCreateUser={handleCreateUser}
          loading={loading}
          CONTROL={CONTROL}
          CONTROL_H={CONTROL_H}
          ACTION_BTN={ACTION_BTN}
        />

        {/* VIEW DETAILS MODAL */}
        <UserDetailsModal
          isOpen={isDetailsModalOpen}
          user={selectedUser}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={(u) => {
            setIsDetailsModalOpen(false);
            openEditModal(u);
          }}
        />

        {/* EDIT USER MODAL */}
        <EditUserModal
          isOpen={isEditModalOpen}
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete ${
            selectedUser ? `${selectedUser.firstName} ${selectedUser.middleName} ${selectedUser.lastName}`.replace(/\s+/g, " ") : "this user"
          }? This action cannot be undone.`}
          confirmText="Delete User"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Users;
