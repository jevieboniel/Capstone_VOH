// src/components/Pages/Reports.js
import React, { useMemo, useState, useDeferredValue, memo, useEffect } from "react";
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
  Home,
  BarChart3,
  BookOpen,
} from "lucide-react";

import Button from "../UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { apiUrl } from "../../config/api";

const stopKeys = (e) => e.stopPropagation();

/* ---------------- Small UI helpers ---------------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={`px-6 py-6 ${className}`}>{children}</div>;

const Input = ({ className = "", ...props }) => (
  <input
    className={`h-11 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-500 transition ${className}`}
    {...props}
  />
);

const Select = ({ className = "", ...props }) => (
  <select
    className={`h-11 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-500 transition ${className}`}
    {...props}
  />
);

const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold shadow-sm ${className}`}>
    {children}
  </span>
);

const getCategoryColor = (category) => {
  switch (category) {
    case "Children":
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20";
    case "Development":
      return "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/20";
    case "Financial":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20";
    case "Houses":
      return "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/20";
    case "System":
    default:
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700";
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case "info":
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20";
    case "warning":
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-100 dark:border-yellow-500/20";
    case "error":
      return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20";
    case "critical":
      return "bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-200 border-red-200 dark:border-red-500/25";
    default:
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700";
  }
};

const getActionIcon = (action) => {
  switch (String(action || "").toUpperCase()) {
    case "CREATE":
      return <Plus className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
    case "UPDATE":
      return <Edit className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
    case "LOGIN":
      return <CheckCircle className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
    case "LOGOUT":
      return <UserX className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
    default:
      return <Activity className="h-4 w-4 text-gray-700 dark:text-gray-200" />;
  }
};

const getRoleColor = (role) => {
  const r = String(role || "").toLowerCase();
  switch (r) {
    case "admin":
      return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20";
    case "staff":
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20";
    case "social_worker":
    case "social worker":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20";
    case "house_parent":
    case "house parent":
      return "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/20";
    default:
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700";
  }
};

const iconByReportKey = (key, category) => {
  const k = String(key || "");
  if (k.includes("health")) return Heart;
  if (k.includes("donation")) return DollarSign;
  if (k.includes("development") || k.includes("milestone")) return TrendingUp;
  if (k.includes("annual")) return BookOpen;
  if (category === "Children") return Users;
  if (category === "Financial") return BarChart3;
  if (category === "Houses") return Home;
  return FileText;
};

/* ---------------- Views ---------------- */
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
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ready-Made Reports</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">All system reports are pre-generated and ready to view or download.</p>
        </div>

        <Pill className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20">
          {filteredReports.length} reports available
        </Pill>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDownCapture={stopKeys}
                onKeyUpCapture={stopKeys}
                onKeyPressCapture={stopKeys}
                className="pl-11"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <Select
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
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {categories
              .filter((c) => c !== "all")
              .map((category) => {
                const count = allReports.filter((r) => r.category === category).length;
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(isActive ? "all" : category)}
                    className={`rounded-2xl border bg-white dark:bg-gray-900 p-4 text-center text-xs shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isActive ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-500/30" : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-gray-600 dark:text-gray-400 font-medium">{category}</p>
                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                  </button>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredReports.map((report) => {
          const Icon = report.icon || FileText;

          return (
            <Card key={report.id}>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-1 gap-4 min-w-0">
                    <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                      <Icon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{report.title}</h3>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{report.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-gray-700 dark:text-gray-200 font-medium">
                          {report.subcategory}
                        </span>

                        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {report.period}
                        </span>

                        <span className="text-gray-500 dark:text-gray-400">
                          {report.fileSize || "—"} {report.pages ? `• ${report.pages} pages` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => onView(report)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDownload(report)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onPrint(report)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Print"
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onShare(report)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Share"
                    >
                      <Share className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-sm text-gray-600 dark:text-gray-400 shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText className="h-6 w-6 text-gray-400" />
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
  stats,
  exportAuditTrail,
}) {
  const todayCount = stats?.todayCount ?? 0;
  const criticalCount = stats?.criticalCount ?? 0;
  const activeUsersCount = stats?.activeUsers ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">System Audit Trail</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track all system activities and user actions.</p>
        </div>

        <Button variant="outline" size="medium" onClick={exportAuditTrail} className="inline-flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Activities</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredAuditTrail.length}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
                <Activity className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today&apos;s Actions</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{todayCount}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
                <Clock className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Critical Events</p>
                <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{criticalCount}</p>
              </div>
              <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3">
                <AlertTriangle className="h-6 w-6 text-red-700 dark:text-red-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Users</p>
                <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">{activeUsersCount}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 p-3">
                <Users className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                onKeyDownCapture={stopKeys}
                onKeyUpCapture={stopKeys}
                onKeyPressCapture={stopKeys}
                className="pl-11"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <Select value={auditFilterModule} onChange={(e) => setAuditFilterModule(e.target.value)} onKeyDownCapture={stopKeys}>
              <option value="all">All Modules</option>
              <option value="Children Management">Children Management</option>
              <option value="User Management">User Management</option>
              <option value="Development Tracking">Development Tracking</option>
              <option value="Donation Management">Donation Management</option>
              <option value="Authentication">Authentication</option>
              <option value="Reports">Reports</option>
              <option value="Alerts">Alerts</option>
              <option value="Audit Trail">Audit Trail</option>
            </Select>

            <Select value={auditFilterAction} onChange={(e) => setAuditFilterAction(e.target.value)} onKeyDownCapture={stopKeys}>
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="VIEW">View</option>
              <option value="DOWNLOAD">Download</option>
              <option value="EXPORT">Export</option>
              <option value="PRINT">Print</option>
              <option value="SHARE">Share</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredAuditTrail.map((entry) => (
          <Card key={entry.id}>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {getActionIcon(entry.action)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.user_name || "Unknown"}</span>

                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getRoleColor(entry.user_role)}`}>
                      {String(entry.user_role || "n/a").replace("_", " ")}
                    </span>

                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getSeverityColor(entry.severity)}`}>
                      {entry.action}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-gray-700 dark:text-gray-200 font-medium">
                      {entry.module}
                    </span>
                  </div>

                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">{entry.details || "-"}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.created_at).toLocaleString()}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {entry.ip_address || "—"}
                    </span>

                    <span>Resource: {entry.resource || "—"}</span>
                    {entry.resource_id && <span>ID: {entry.resource_id}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAuditTrail.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-sm text-gray-600 dark:text-gray-400 shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Search className="h-6 w-6 text-gray-400" />
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
  const { authFetch } = useAuth();

  const [activeView, setActiveView] = useState("reports");

  // reports
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  // audit
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditFilterModule, setAuditFilterModule] = useState("all");
  const [auditFilterAction, setAuditFilterAction] = useState("all");
  const deferredAuditSearch = useDeferredValue(auditSearchTerm);

  const [reports, setReports] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [auditStats, setAuditStats] = useState({ todayCount: 0, criticalCount: 0, activeUsers: 0 });

  const categories = useMemo(() => ["all", "Children", "Development", "Financial", "Houses", "System"], []);

  // Load reports from API
  useEffect(() => {
    if (activeView !== "reports") return;

    const run = async () => {
      const q = deferredSearch.trim();
      const cat = selectedCategory;
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (cat && cat !== "all") qs.set("category", cat);

      const res = await authFetch(`/reports?${qs.toString()}`, { method: "GET" });
      const data = await res.json();
      if (data.success) {
        const mapped = (data.reports || []).map((r) => ({
          ...r,
          icon: iconByReportKey(r.reportKey, r.category),
        }));
        setReports(mapped);
      } else {
        setReports([]);
      }
    };

    run().catch((e) => {
      console.error(e);
      setReports([]);
    });
  }, [activeView, deferredSearch, selectedCategory, authFetch]);

  // Load audit trail from API
  useEffect(() => {
    if (activeView !== "audit") return;

    const run = async () => {
      const qs = new URLSearchParams();
      const q = deferredAuditSearch.trim();
      if (q) qs.set("q", q);
      if (auditFilterModule !== "all") qs.set("module", auditFilterModule);
      if (auditFilterAction !== "all") qs.set("action", auditFilterAction);

      const res = await authFetch(`/audit-trail?${qs.toString()}`, { method: "GET" });
      const data = await res.json();
      if (data.success) {
        setAuditEntries(data.entries || []);
        setAuditStats(data.stats || { todayCount: 0, criticalCount: 0, activeUsers: 0 });
      } else {
        setAuditEntries([]);
        setAuditStats({ todayCount: 0, criticalCount: 0, activeUsers: 0 });
      }
    };

    run().catch((e) => {
      console.error(e);
      setAuditEntries([]);
      setAuditStats({ todayCount: 0, criticalCount: 0, activeUsers: 0 });
    });
  }, [activeView, deferredAuditSearch, auditFilterModule, auditFilterAction, authFetch]);

  const filteredReports = useMemo(() => reports, [reports]);

  const filteredAuditTrail = useMemo(() => auditEntries, [auditEntries]);

  const exportAuditTrail = () => {
    const base = apiUrl("/api/audit-trail/export.csv");
    const qs = new URLSearchParams();
    if (auditSearchTerm.trim()) qs.set("q", auditSearchTerm.trim());
    if (auditFilterModule !== "all") qs.set("module", auditFilterModule);
    if (auditFilterAction !== "all") qs.set("action", auditFilterAction);

    // open CSV in new tab with auth token (use fetch then blob)
    (async () => {
      const res = await authFetch(`/audit-trail/export.csv?${qs.toString()}`, { method: "GET" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit_trail.csv";
      a.click();
      URL.revokeObjectURL(url);
    })().catch(console.error);
  };

  const onView = async (r) => {
    await authFetch(`/reports/${r.id}/view`, { method: "POST" });
    // If you have a fileUrl, you can open it:
    if (r.fileUrl) window.open(r.fileUrl, "_blank");
  };

  const onDownload = async (r) => {
    const res = await authFetch(`/reports/${r.id}/download`, { method: "POST" });
    const data = await res.json();
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const onPrint = async (r) => {
    await authFetch(`/reports/${r.id}/print`, { method: "POST" });
    window.print();
  };

  const onShare = async (r) => {
    await authFetch(`/reports/${r.id}/share`, { method: "POST" });
    alert("Share action logged ✅ (implement actual share flow if needed)");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Alerts</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View ready-made reports and review the system audit trail.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 shadow-sm flex gap-2 w-full sm:w-auto">
            <Button
              variant={activeView === "reports" ? "primary" : "outline"}
              size="medium"
              onClick={() => setActiveView("reports")}
              className={`inline-flex items-center gap-2 rounded-xl ${activeView === "reports" ? "shadow-sm" : "border-transparent"}`}
            >
              <FileText className="h-4 w-4" />
              Reports
            </Button>

            <Button
              variant={activeView === "audit" ? "primary" : "outline"}
              size="medium"
              onClick={() => setActiveView("audit")}
              className={`inline-flex items-center gap-2 rounded-xl ${activeView === "audit" ? "shadow-sm" : "border-transparent"}`}
            >
              <Shield className="h-4 w-4" />
              Audit Trail
            </Button>
          </div>
        </div>

        {activeView === "reports" ? (
          <ReportsView
            categories={categories}
            allReports={reports}
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
            stats={auditStats}
            exportAuditTrail={exportAuditTrail}
          />
        )}
      </div>
    </div>
  );
}
