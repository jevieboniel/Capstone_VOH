import React, { useMemo, useState, useDeferredValue, memo } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  Printer,
  Share,
  Eye,
  Shield,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserX,
  Edit,
  Plus,
  Trash2,
  Activity,
  GraduationCap,
  Home,
  BarChart3,
  BookOpen,
} from "lucide-react";

/* ---------------- Mock Data ---------------- */

const mockChildren = [
  { id: 1, name: "Sarah Mwangi", age: 8, gender: "Female", house: "Sunshine House", education: "Grade 3", healthStatus: "Good" },
  { id: 2, name: "John Kipchoge", age: 12, gender: "Male", house: "Rainbow House", education: "Grade 7", healthStatus: "Excellent" },
  { id: 3, name: "Maria Wanjiku", age: 6, gender: "Female", house: "Hope House", education: "Pre-School", healthStatus: "Needs Check-up" },
  { id: 4, name: "David Ochieng", age: 15, gender: "Male", house: "Unity House", education: "Form 2", healthStatus: "Good" },
  { id: 5, name: "Grace Akinyi", age: 9, gender: "Female", house: "Sunshine House", education: "Grade 4", healthStatus: "Good" },
];

const mockMilestones = [
  { id: 1, childId: 1, category: "Physical", status: "Completed" },
  { id: 2, childId: 1, category: "Educational", status: "In Progress" },
  { id: 3, childId: 2, category: "Educational", status: "Completed" },
  { id: 4, childId: 3, category: "Health", status: "At Risk" },
  { id: 5, childId: 4, category: "Social", status: "Completed" },
];

const mockAuditTrail = [
  {
    id: 1,
    timestamp: "2025-10-08T10:30:00Z",
    userId: "user_001",
    userName: "Sarah Johnson",
    userRole: "admin",
    action: "CREATE",
    resource: "Child Profile",
    resourceId: "child_023",
    details: "Created new child profile for Maria Santos, age 7",
    ipAddress: "192.168.1.100",
    severity: "info",
    module: "Children Management",
  },
  {
    id: 2,
    timestamp: "2025-10-08T10:25:00Z",
    userId: "user_002",
    userName: "Michael Chen",
    userRole: "staff",
    action: "UPDATE",
    resource: "Child Profile",
    resourceId: "child_015",
    details: 'Updated health status for John Doe from "Good" to "Excellent"',
    ipAddress: "192.168.1.101",
    severity: "info",
    module: "Children Management",
  },
  {
    id: 3,
    timestamp: "2025-10-08T10:15:00Z",
    userId: "user_001",
    userName: "Sarah Johnson",
    userRole: "admin",
    action: "DELETE",
    resource: "User Account",
    resourceId: "user_024",
    details: "Deleted inactive user account for former staff member Lisa Wilson",
    ipAddress: "192.168.1.100",
    severity: "warning",
    module: "User Management",
  },
  {
    id: 4,
    timestamp: "2025-10-08T10:05:00Z",
    userId: "user_004",
    userName: "David Thompson",
    userRole: "house_parent",
    action: "CREATE",
    resource: "Health Record",
    resourceId: "health_078",
    details: "Added routine check-up record for Sarah Mwangi",
    ipAddress: "192.168.1.103",
    severity: "info",
    module: "Children Management",
  },
  {
    id: 5,
    timestamp: "2025-10-08T09:55:00Z",
    userId: "user_003",
    userName: "Emily Rodriguez",
    userRole: "social_worker",
    action: "UPDATE",
    resource: "Development Milestone",
    resourceId: "milestone_045",
    details: 'Updated progress for milestone "Reading Grade Level 3" from 65% to 75%',
    ipAddress: "192.168.1.102",
    severity: "info",
    module: "Development Tracking",
  },
  {
    id: 6,
    timestamp: "2025-10-08T09:50:00Z",
    userId: "user_002",
    userName: "Michael Chen",
    userRole: "staff",
    action: "CREATE",
    resource: "Donation Record",
    resourceId: "donation_156",
    details: "Recorded new donation of $500 from Corporate Partner ABC Inc.",
    ipAddress: "192.168.1.101",
    severity: "info",
    module: "Donation Management",
  },
  {
    id: 7,
    timestamp: "2025-10-08T09:45:00Z",
    userId: "user_001",
    userName: "Sarah Johnson",
    userRole: "admin",
    action: "LOGIN",
    resource: "System Access",
    resourceId: "session_891",
    details: "User logged into the system",
    ipAddress: "192.168.1.100",
    severity: "info",
    module: "Authentication",
  },
];

/* ---------------- Helpers ---------------- */

const calculateChildStats = (childId) => {
  const ms = mockMilestones.filter((m) => m.childId === childId);
  const total = ms.length;
  const completed = ms.filter((m) => m.status === "Completed").length;
  const inProgress = ms.filter((m) => m.status === "In Progress").length;
  const overall =
    total === 0
      ? 0
      : Math.round((completed / total) * 100 + (inProgress * 25) / total);

  return { totalMilestones: total, completedMilestones: completed, inProgressMilestones: inProgress, overall };
};

const generateAllReports = () => {
  const reports = [];
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = today.toISOString().split("T")[0];

  mockChildren.forEach((child) => {
    const childStats = calculateChildStats(child.id);

    reports.push({
      id: `child-profile-${child.id}`,
      title: `${child.name} - Complete Profile Report`,
      description: "Comprehensive profile including personal info, health records, education, and development milestones.",
      category: "Children",
      subcategory: "Individual Profiles",
      type: "Child Profile",
      generatedDate: todayStr,
      period: currentMonth,
      status: "Ready",
      fileSize: "1.2 MB",
      pages: 8,
      format: "PDF",
      icon: FileText,
      childName: child.name,
      metadata: { childId: child.id, age: child.age, house: child.house, totalMilestones: childStats.totalMilestones },
    });

    reports.push({
      id: `child-health-${child.id}`,
      title: `${child.name} - Health Records Report`,
      description: "Medical history, vaccinations, check-ups, and overall health status.",
      category: "Children",
      subcategory: "Health Records",
      type: "Health Report",
      generatedDate: todayStr,
      period: currentMonth,
      status: "Ready",
      fileSize: "0.8 MB",
      pages: 4,
      format: "PDF",
      icon: Heart,
      childName: child.name,
      metadata: { healthStatus: child.healthStatus },
    });

    reports.push({
      id: `child-education-${child.id}`,
      title: `${child.name} - Education Progress Report`,
      description: "Academic performance, grades, and teacher comments overview.",
      category: "Children",
      subcategory: "Education Records",
      type: "Education Report",
      generatedDate: todayStr,
      period: currentMonth,
      status: "Ready",
      fileSize: "0.6 MB",
      pages: 5,
      format: "PDF",
      icon: GraduationCap,
      childName: child.name,
      metadata: { currentGrade: child.education },
    });
  });

  reports.push({
    id: "children-overview",
    title: "All Children Overview Report",
    description: "Summary of all children including demographics, health status, and placement.",
    category: "Children",
    subcategory: "Summary Reports",
    type: "Overview",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "2.5 MB",
    pages: 12,
    format: "PDF",
    icon: Users,
    metadata: { totalChildren: mockChildren.length },
  });

  reports.push({
    id: "health-summary",
    title: "Health Status Summary Report",
    description: "Aggregated health data for all children including upcoming check-ups.",
    category: "Children",
    subcategory: "Summary Reports",
    type: "Health Summary",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "1.8 MB",
    pages: 8,
    format: "PDF",
    icon: Heart,
    metadata: { needingCheckup: mockChildren.filter((c) => c.healthStatus === "Needs Check-up").length },
  });

  reports.push({
    id: "development-overall",
    title: "Overall Development Progress Report",
    description: "Comprehensive analysis of development milestones across all children.",
    category: "Development",
    subcategory: "Summary Reports",
    type: "Development Overview",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "3.2 MB",
    pages: 18,
    format: "PDF",
    icon: TrendingUp,
  });

  reports.push({
    id: "milestones-at-risk",
    title: "At-Risk Milestones Report",
    description: "Milestones falling behind schedule that require immediate attention.",
    category: "Development",
    subcategory: "Priority Reports",
    type: "At-Risk Milestones",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "0.9 MB",
    pages: 4,
    format: "PDF",
    icon: AlertTriangle,
  });

  reports.push({
    id: "milestones-completed",
    title: "Completed Milestones Report",
    description: "Summary of milestones successfully achieved this period.",
    category: "Development",
    subcategory: "Achievement Reports",
    type: "Completed Milestones",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "1.6 MB",
    pages: 7,
    format: "PDF",
    icon: CheckCircle,
  });

  reports.push({
    id: "donations-summary",
    title: "Donation Summary Report",
    description: "Overview of donations including trends, top donors, and fund allocation.",
    category: "Financial",
    subcategory: "Donation Reports",
    type: "Donation Summary",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "2.1 MB",
    pages: 11,
    format: "PDF",
    icon: DollarSign,
  });

  reports.push({
    id: "financial-summary",
    title: "Financial Summary Report",
    description: "Income, expenses, and budget allocation overview for this period.",
    category: "Financial",
    subcategory: "Financial Reports",
    type: "Financial Summary",
    generatedDate: todayStr,
    period: currentMonth,
    status: "Ready",
    fileSize: "2.8 MB",
    pages: 15,
    format: "PDF",
    icon: BarChart3,
  });

  const houses = ["Sunshine House", "Rainbow House", "Hope House", "Unity House"];
  houses.forEach((house) => {
    const houseChildren = mockChildren.filter((c) => c.house === house);
    reports.push({
      id: `house-${house.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${house} - House Report`,
      description: "Overview of children, activities, and needs for this house.",
      category: "Houses",
      subcategory: "House Reports",
      type: "House Overview",
      generatedDate: todayStr,
      period: currentMonth,
      status: "Ready",
      fileSize: "1.0 MB",
      pages: 5,
      format: "PDF",
      icon: Home,
      metadata: { totalChildren: houseChildren.length },
    });
  });

  reports.push({
    id: "annual-summary",
    title: "Annual Summary Report",
    description: "Year-end summary covering major areas of operations.",
    category: "System",
    subcategory: "Annual Reports",
    type: "Annual Summary",
    generatedDate: todayStr,
    period: "2025",
    status: "Ready",
    fileSize: "5.2 MB",
    pages: 35,
    format: "PDF",
    icon: BookOpen,
  });

  return reports;
};

const getCategoryColor = (category) => {
  switch (category) {
    case "Children": return "bg-blue-100 text-blue-800";
    case "Development": return "bg-purple-100 text-purple-800";
    case "Financial": return "bg-emerald-100 text-emerald-800";
    case "Houses": return "bg-orange-100 text-orange-800";
    case "System": return "bg-slate-100 text-slate-800";
    default: return "bg-slate-100 text-slate-800";
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case "info": return "bg-blue-100 text-blue-800";
    case "warning": return "bg-yellow-100 text-yellow-800";
    case "error": return "bg-red-100 text-red-800";
    case "critical": return "bg-red-200 text-red-900";
    default: return "bg-slate-100 text-slate-800";
  }
};

const getActionIcon = (action) => {
  switch (action) {
    case "CREATE": return <Plus className="h-4 w-4" />;
    case "UPDATE": return <Edit className="h-4 w-4" />;
    case "DELETE": return <Trash2 className="h-4 w-4" />;
    case "LOGIN": return <CheckCircle className="h-4 w-4" />;
    case "LOGOUT": return <UserX className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin": return "bg-red-100 text-red-800";
    case "staff": return "bg-blue-100 text-blue-800";
    case "social_worker": return "bg-emerald-100 text-emerald-800";
    case "house_parent": return "bg-purple-100 text-purple-800";
    default: return "bg-slate-100 text-slate-800";
  }
};

/* ---------------- IMPORTANT FIX ----------------
   If something in your app (TopNav/SideNav/MainLayout)
   listens for key presses globally, it can interrupt the input.
   These handlers block propagation so typing is normal.
------------------------------------------------- */
const stopKeys = (e) => e.stopPropagation();

const ReportsView = memo(function ReportsView({
  categories,
  allReports,
  filteredReports,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onView,
  onDownload,
  onPrint,
  onShare,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ready-Made Reports</h2>
          <p className="text-sm text-slate-500">All system reports are pre-generated and ready to download or view.</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {filteredReports.length} reports available
        </span>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDownCapture={stopKeys}
              onKeyUpCapture={stopKeys}
              onKeyPressCapture={stopKeys}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div>
            <select
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              onKeyDownCapture={stopKeys}
              onKeyUpCapture={stopKeys}
              onKeyPressCapture={stopKeys}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {categories.filter((c) => c !== "all").map((category) => {
          const count = allReports.filter((r) => r.category === category).length;
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(isActive ? "all" : category)}
              className={`rounded-2xl border bg-white p-3 text-center text-xs shadow-sm transition-all hover:shadow-md ${
                isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-100"
              }`}
            >
              <p className="text-slate-600">{category}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredReports.map((report) => {
          const Icon = report.icon || FileText;
          return (
            <div key={report.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{report.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{report.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${getCategoryColor(report.category)}`}>
                        {report.category}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                        {report.subcategory}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" /> {report.period}
                      </span>
                      <span className="text-slate-500">{report.fileSize} • {report.pages} pages</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2 self-start">
                  <button type="button" onClick={() => onView(report)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDownload(report)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onPrint(report)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Print">
                    <Printer className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onShare(report)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Share">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            No reports found. Try changing your search or filters.
          </div>
        )}
      </div>
    </div>
  );
});

const AuditTrailView = memo(function AuditTrailView({
  filteredAuditTrail,
  auditSearchTerm,
  setAuditSearchTerm,
  auditFilterModule,
  setAuditFilterModule,
  auditFilterAction,
  setAuditFilterAction,
  todayCount,
  criticalCount,
  activeUsersCount,
  exportAuditTrail,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">System Audit Trail</h2>
          <p className="text-sm text-slate-500">Track all system activities and user actions.</p>
        </div>
        <button
          type="button"
          onClick={exportAuditTrail}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total Activities</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{filteredAuditTrail.length}</p>
            </div>
            <Activity className="h-7 w-7 text-blue-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Today&apos;s Actions</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{todayCount}</p>
            </div>
            <Clock className="h-7 w-7 text-emerald-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Critical Events</p>
              <p className="mt-1 text-xl font-bold text-red-700">{criticalCount}</p>
            </div>
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Active Users</p>
              <p className="mt-1 text-xl font-bold text-purple-700">{activeUsersCount}</p>
            </div>
            <Users className="h-7 w-7 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              value={auditSearchTerm}
              onChange={(e) => setAuditSearchTerm(e.target.value)}
              onKeyDownCapture={stopKeys}
              onKeyUpCapture={stopKeys}
              onKeyPressCapture={stopKeys}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div>
            <select
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              value={auditFilterModule}
              onChange={(e) => setAuditFilterModule(e.target.value)}
              onKeyDownCapture={stopKeys}
            >
              <option value="all">All Modules</option>
              <option value="Children Management">Children Management</option>
              <option value="User Management">User Management</option>
              <option value="Development Tracking">Development Tracking</option>
              <option value="Donation Management">Donation Management</option>
              <option value="Authentication">Authentication</option>
            </select>
          </div>

          <div>
            <select
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              value={auditFilterAction}
              onChange={(e) => setAuditFilterAction(e.target.value)}
              onKeyDownCapture={stopKeys}
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredAuditTrail.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                {getActionIcon(entry.action)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900">{entry.userName}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${getRoleColor(entry.userRole)}`}>
                    {entry.userRole.replace("_", " ")}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${getSeverityColor(entry.severity)}`}>
                    {entry.action}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                    {entry.module}
                  </span>
                </div>

                <p className="mb-2 text-sm text-slate-700">{entry.details}</p>

                <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {entry.ipAddress}
                  </span>
                  <span>Resource: {entry.resource}</span>
                  {entry.resourceId && <span>ID: {entry.resourceId}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAuditTrail.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            No audit entries matched your filters.
          </div>
        )}
      </div>
    </div>
  );
});

/* ---------------- Main Component ---------------- */

export default function Reports() {
  const [activeView, setActiveView] = useState("reports");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditFilterModule, setAuditFilterModule] = useState("all");
  const [auditFilterAction, setAuditFilterAction] = useState("all");

  // Defer search typing so UI stays smooth even with many items
  const deferredSearch = useDeferredValue(searchTerm);
  const deferredAuditSearch = useDeferredValue(auditSearchTerm);

  // Generate once (NOT every keypress)
  const allReports = useMemo(() => generateAllReports(), []);

  const categories = useMemo(
    () => ["all", "Children", "Development", "Financial", "Houses", "System"],
    []
  );

  const filteredReports = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return allReports.filter((r) => {
      const catOk = selectedCategory === "all" || r.category === selectedCategory;
      if (!q) return catOk;
      const t = (r.title || "").toLowerCase();
      const d = (r.description || "").toLowerCase();
      const c = (r.childName || "").toLowerCase();
      return catOk && (t.includes(q) || d.includes(q) || c.includes(q));
    });
  }, [allReports, selectedCategory, deferredSearch]);

  const filteredAuditTrail = useMemo(() => {
    const q = deferredAuditSearch.trim().toLowerCase();
    return mockAuditTrail.filter((e) => {
      const searchOk =
        !q ||
        e.userName.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q);

      const moduleOk = auditFilterModule === "all" || e.module === auditFilterModule;
      const actionOk = auditFilterAction === "all" || e.action === auditFilterAction;

      return searchOk && moduleOk && actionOk;
    });
  }, [deferredAuditSearch, auditFilterModule, auditFilterAction]);

  // These are plain derived values (no warnings)
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return filteredAuditTrail.filter((e) => new Date(e.timestamp).toDateString() === today).length;
  }, [filteredAuditTrail]);

  const criticalCount = useMemo(() => {
    return filteredAuditTrail.filter((e) => e.severity === "warning" || e.severity === "error").length;
  }, [filteredAuditTrail]);

  const activeUsersCount = useMemo(() => {
    return new Set(filteredAuditTrail.map((e) => e.userId)).size;
  }, [filteredAuditTrail]);

  const exportAuditTrail = () => {
    const csvContent = [
      ["Timestamp", "User", "Role", "Action", "Resource", "Resource ID", "Module", "Details", "IP Address"],
      ...filteredAuditTrail.map((e) => [
        e.timestamp,
        e.userName,
        e.userRole,
        e.action,
        e.resource,
        e.resourceId || "",
        e.module,
        `"${(e.details || "").replace(/"/g, '""')}"`,
        e.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onView = (r) => console.log("View report:", r.title);
  const onDownload = (r) => console.log("Download report:", r.title);
  const onPrint = (r) => console.log("Print report:", r.title);
  const onShare = (r) => console.log("Share report:", r.title);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Alerts</h1>
            <p className="mt-1 text-sm text-slate-500">View ready-made reports and review the system audit trail.</p>
          </div>

          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                activeView === "reports" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setActiveView("reports")}
            >
              <span className="inline-flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Reports
              </span>
            </button>

            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                activeView === "audit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setActiveView("audit")}
            >
              <span className="inline-flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Audit Trail
              </span>
            </button>
          </div>
        </div>

        {activeView === "reports" ? (
          <ReportsView
            categories={categories}
            allReports={allReports}
            filteredReports={filteredReports}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onView={onView}
            onDownload={onDownload}
            onPrint={onPrint}
            onShare={onShare}
          />
        ) : (
          <AuditTrailView
            filteredAuditTrail={filteredAuditTrail}
            auditSearchTerm={auditSearchTerm}
            setAuditSearchTerm={setAuditSearchTerm}
            auditFilterModule={auditFilterModule}
            setAuditFilterModule={setAuditFilterModule}
            auditFilterAction={auditFilterAction}
            setAuditFilterAction={setAuditFilterAction}
            todayCount={todayCount}
            criticalCount={criticalCount}
            activeUsersCount={activeUsersCount}
            exportAuditTrail={exportAuditTrail}
          />
        )}
      </div>
    </div>
  );
}
