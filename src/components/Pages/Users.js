import React, { useState, useEffect } from 'react';
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
  UserPlus,
  MoreVertical,
  Eye,
  Key,
  Ban,
  CheckCircle,
  Clock,
} from 'lucide-react';

import Button from '../UI/Button';
import FormModal from '../UI/FormModal';
import ConfirmationModal from '../UI/ConfirmationModal';

// ----- SAMPLE DATA -----
const initialUsers = [
  {
    id: 1,
    firstName: 'John',
    middleName: '',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    phone: '+254700111111',
    permissions: ['Full Access'],
    avatarUrl: '',
  },
  {
    id: 2,
    firstName: 'Jane',
    middleName: '',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'Staff',
    status: 'Active',
    createdAt: '2024-01-16',
    lastLogin: '2024-01-19T08:15:00Z',
    phone: '+254700222222',
    permissions: ['Child Management', 'Reports'],
    avatarUrl: '',
  },
  {
    id: 3,
    firstName: 'Mike',
    middleName: '',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    role: 'Moderator',
    status: 'Inactive',
    createdAt: '2024-01-17',
    lastLogin: '2024-01-18T14:00:00Z',
    phone: '+254700333333',
    permissions: ['Reports'],
    avatarUrl: '',
  },
  {
    id: 4,
    firstName: 'Sarah',
    middleName: '',
    lastName: 'Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Staff',
    status: 'Active',
    createdAt: '2024-01-18',
    lastLogin: '2024-01-20T06:45:00Z',
    phone: '+254700444444',
    permissions: ['Donations', 'Child Management'],
    avatarUrl: '',
  },
];

// ----- PERMISSIONS SETUP -----
const availablePermissions = [
  'Child Management',
  'Development Tracking',
  'Donations',
  'Reports',
  'User Management',
  'Settings',
];

const rolePermissions = {
  Admin: ['Full Access'],
  Staff: ['Child Management', 'Reports', 'Donations', 'Development Tracking'],
  'Social Worker': ['Child Management', 'Development Tracking', 'Reports'],
  'House Parent': ['Child Management', 'Development Tracking'],
};

// ----- HELPERS -----
const getRoleBadgeClasses = (role) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'Staff':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'Social Worker':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'House Parent':
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'Inactive':
      return 'bg-slate-50 text-slate-700 border border-slate-200';
    case 'Suspended':
      return 'bg-red-50 text-red-700 border border-red-100';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const formatLastLogin = (iso) => {
  if (!iso) return 'Never';
  const now = new Date();
  const last = new Date(iso);
  const diffMs = now.getTime() - last.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return last.toLocaleDateString();
};

// ----- USER CARD COMPONENT -----
const UserCard = ({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  onViewDetails,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`
    .replace(/\s+/g, ' ')
    .trim();

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  const hasAvatar = !!user.avatarUrl;

  const handleMenuItem = (cb) => {
    setMenuOpen(false);
    cb && cb(user);
  };

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        {/* Left: avatar + info */}
        <div className="flex items-start gap-4 min-w-0">
          {hasAvatar ? (
            <img
              src={user.avatarUrl}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 flex items-center justify-center font-semibold text-lg border border-indigo-100">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{fullName}</h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClasses(
                  user.role
                )}`}
              >
                {user.role}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                  user.status
                )}`}
              >
                {user.status}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="truncate">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Joined: {user.createdAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Last login: {formatLastLogin(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-start gap-2 relative">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="h-10 w-10 rounded-xl border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-gray-700" />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="h-10 w-10 rounded-xl border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center transition-colors"
            title="More"
          >
            <MoreVertical className="h-4 w-4 text-gray-700" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-1 text-sm z-10 overflow-hidden">
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-left"
                onClick={() => handleMenuItem(onViewDetails)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-left"
                onClick={() => handleMenuItem(onEdit)}
              >
                <Edit className="h-4 w-4" />
                Edit User
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-left"
                onClick={() => handleMenuItem(onResetPassword)}
              >
                <Key className="h-4 w-4" />
                Reset Password
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left ${
                  user.status === 'Active' ? 'text-orange-600' : 'text-emerald-600'
                }`}
                onClick={() => handleMenuItem(onToggleStatus)}
              >
                {user.status === 'Active' ? (
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

              <div className="my-1 border-t border-gray-100" />

              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-red-600 text-left"
                onClick={() => handleMenuItem(onDelete)}
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permissions */}
      {user.permissions && user.permissions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border border-gray-200 bg-gray-50 text-gray-700 font-medium"
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
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  // modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add User modal state
  const [newUser, setNewUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    permissions: [],
    avatarUrl: '',
  });

  // Fields for EDIT modal (FormModal)
  const userFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'middleName', label: 'Middle Name', type: 'text', placeholder: 'Enter middle name' },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'Admin', label: 'Administrator' },
        { value: 'Staff', label: 'Staff' },
        { value: 'Social Worker', label: 'Social Worker' },
        { value: 'House Parent', label: 'House Parent' },
        { value: 'Moderator', label: 'Moderator' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
    },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Enter phone number' },
  ];

  // ------- FILTERING -------
  useEffect(() => {
    const q = searchTerm.toLowerCase();

    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      const matchesSearch =
        fullName.includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q);

      const matchesRole = selectedRole === 'All' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, selectedRole, selectedStatus]);

  // ------- PAGINATION -------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // ------- ACTIONS -------
  const handleEdit = (userData) => {
    setLoading(true);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user))
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setLoading(false);
    }, 800);
  };

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      setLoading(false);
    }, 800);
  };

  const handleToggleStatus = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
  };

  const handleResetPassword = (user) => {
    alert(`Password reset email would be sent to ${user.email}`);
  };

  const handleViewDetails = (user) => {
    alert(`View details for ${user.firstName} ${user.lastName}`);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Add User modal helpers
  const togglePermission = (permission) => {
    setNewUser((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNewUser((prev) => ({ ...prev, avatarUrl: url }));
  };

  const handleCreateUser = () => {
    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim() || !newUser.role) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Role).');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;

      const userToAdd = {
        id: newId,
        firstName: newUser.firstName.trim(),
        middleName: newUser.middleName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        phone: newUser.phone.trim(),
        avatarUrl: newUser.avatarUrl,
        permissions:
          newUser.permissions.length > 0
            ? newUser.permissions
            : rolePermissions[newUser.role] || [],
      };

      setUsers((prev) => [userToAdd, ...prev]);
      setIsAddModalOpen(false);
      setLoading(false);
      setNewUser({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        permissions: [],
        avatarUrl: '',
      });
    }, 800);
  };

  // ------- STATS -------
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const inactiveSuspended = users.filter((u) => u.status !== 'Active').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto px-5 py-2.5 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-md">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl shadow-md">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-l-slate-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inactive/Suspended</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{inactiveSuspended}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-3 rounded-2xl shadow-md">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admins</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{adminCount}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-2xl shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <select
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Social Worker">Social Worker</option>
              <option value="House Parent">House Parent</option>
              <option value="Moderator">Moderator</option>
            </select>

            <select
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* USER CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {currentUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
              onViewDetails={handleViewDetails}
            />
          ))}

          {currentUsers.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600 shadow-sm">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1} to{' '}
              {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
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
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ADD USER MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-7 border border-gray-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center shadow-md">
                      <UserPlus className="h-4 w-4 text-white" />
                    </span>
                    <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Create a new user account with appropriate role and permissions.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 w-10 rounded-xl border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center text-gray-600 transition-colors"
                  title="Close"
                >
                  ×
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
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 text-2xl font-semibold border border-indigo-100">
                        ?
                      </div>
                    )}

                    <label className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 text-center md:text-left">
                      JPG or PNG, max ~2MB.
                    </p>
                  </div>

                  {/* Inputs */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        placeholder="Enter middle name"
                        value={newUser.middleName}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, middleName: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={newUser.email}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        placeholder="Enter phone number"
                        value={newUser.phone}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  <p className="text-sm font-medium text-gray-900">
                    Permissions{' '}
                    <span className="font-normal text-gray-600">
                      (Optional - defaults will be applied based on role)
                    </span>
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEdit}
          title="Edit User"
          fields={userFields}
          initialData={selectedUser || {}}
          submitText="Update User"
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
            selectedUser
              ? `${selectedUser.firstName} ${selectedUser.middleName} ${selectedUser.lastName}`.replace(/\s+/g, ' ')
              : 'this user'
          }? This action cannot be undone.`}
          confirmText="Delete User"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Users;
