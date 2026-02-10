// src/Pages/Reports.js
import React, { useEffect, useMemo, useState, useDeferredValue, memo } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
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
} from "lucide-react";

import Button from "../UI/Button";
import { apiUrl } from "../../config/api";

/* ---------------- Helpers ---------------- */

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
  switch (action) {
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
  switch (role) {
    case "admin":
      return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20";
    case "staff":
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20";
    case "social_worker":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20";
    case "house_parent":
      return "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/20";
    default:
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700";
  }
};

/* Input key propagation fix */
const stopKeys = (e) => e.stopPropagation();

/* ---------------- Small UI helpers ---------------- */

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-6 ${className}`}>{children}</div>
);

/** ✅ SIZE/ALIGN MATCH (no style change): make controls consistent with other pages (h-11) */
const Input = ({ className = "", ...props }) => (
  <input
    className={`h-11 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-500 transition ${className}`}
    {...props}
  />
);

/** ✅ SIZE/ALIGN MATCH (no style change): make selects consistent with other pages (h-11) */
const Select = ({ className = "", ...props }) => (
  <select
    className={`h-11 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-500 transition ${className}`}
    {...props}
  />
);

const Pill = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold shadow-sm ${className}`}
  >
    {children}
  </span>
);

/* ---------------- Views ---------------- */

const ReportsView = memo(function ReportsView({
  categories,
  allReports,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onView,
  onDownload,
  onPrint,
  onShare,
  loading,

  // ✅ generator props
  reportType,
  setReportType,
  reportFormat,
  setReportFormat,
  generating,
  generateReport,
}) {
  const filteredReports = allReports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reports Generator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate reports from Children records, Donation summary, or Audit trail.
          </p>
        </div>

        <Pill className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20">
          {loading ? "Loading..." : `${filteredReports.length} reports available`}
        </Pill>
      </div>

      {/* ✅ Generate Report Card */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Generate Report</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Select report type and output format (PDF or CSV).
              </p>
            </div>

            <Button onClick={generateReport} disabled={generating} className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)} onKeyDownCapture={stopKeys}>
              <option value="children_records">Children Records Report</option>
              <option value="donation_summary">Donation Summary Report</option>
              <option value="audit_report">Audit Report</option>
            </Select>

            <Select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} onKeyDownCapture={stopKeys}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Existing Filters (optional list) */}
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
        </CardContent>
      </Card>

      {/* Optional: List previously generated reports if backend supports GET /api/reports */}
      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {filteredReports.map((report) => {
          const Icon =
            report.category === "Children"
              ? Users
              : report.category === "Development"
              ? TrendingUp
              : report.category === "Financial"
              ? DollarSign
              : report.category === "Houses"
              ? Home
              : FileText;

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
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getCategoryColor(
                            report.category
                          )}`}
                        >
                          {report.category}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-gray-700 dark:text-gray-200 font-medium">
                          {report.subcategory}
                        </span>

                        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" /> {report.period}
                        </span>

                        <span className="text-gray-500 dark:text-gray-400">
                          {(report.fileSize || "—")} • {(report.pages || 0)} pages
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

        {!loading && filteredReports.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-sm text-gray-600 dark:text-gray-400 shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            No reports found. Generate one above.
          </div>
        )}
      </div>
    </div>
  );
});

const AuditTrailView = memo(function AuditTrailView({
  auditRows,
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
  loading,
  totalCount,
}) {
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
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? "…" : totalCount}
                </p>
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
                <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{loading ? "…" : todayCount}</p>
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
                <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{loading ? "…" : criticalCount}</p>
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
                <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">{loading ? "…" : activeUsersCount}</p>
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
            </Select>

            <Select value={auditFilterAction} onChange={(e) => setAuditFilterAction(e.target.value)} onKeyDownCapture={stopKeys}>
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="VIEW">View</option>
              <option value="EXPORT">Export</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
        {auditRows.map((entry) => (
          <Card key={entry.id}>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {getActionIcon(entry.action)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.userName}</span>

                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getRoleColor(entry.userRole)}`}>
                      {String(entry.userRole || "").replace("_", " ")}
                    </span>

                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold ${getSeverityColor(entry.severity)}`}>
                      {entry.action}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-gray-700 dark:text-gray-200 font-medium">
                      {entry.module}
                    </span>
                  </div>

                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">{entry.details}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
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
            </CardContent>
          </Card>
        ))}

        {!loading && auditRows.length === 0 && (
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
  const [activeView, setActiveView] = useState("reports");

  // reports filters (kept for compatibility if backend supports list endpoint)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ report generator
  const [reportType, setReportType] = useState("children_records");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);

  // audit filters
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditFilterModule, setAuditFilterModule] = useState("all");
  const [auditFilterAction, setAuditFilterAction] = useState("all");

  const deferredSearch = useDeferredValue(searchTerm);
  const deferredAuditSearch = useDeferredValue(auditSearchTerm);

  const categories = useMemo(() => ["all", "Children", "Development", "Financial", "Houses", "System"], []);

  const [reportsLoading, setReportsLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const [allReports, setAllReports] = useState([]);

  const [auditRows, setAuditRows] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // ✅ Generate report (PDF/CSV download)
  const generateReport = async () => {
    try {
      setGenerating(true);

      const res = await fetch(apiUrl("/api/reports/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: reportType, format: reportFormat }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Failed to generate report.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}.${reportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(e.message || "Report generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  // ---------------- Fetch Reports (optional list if your backend supports GET /api/reports) ----------------
  useEffect(() => {
    if (activeView !== "reports") return;

    const controller = new AbortController();
    const run = async () => {
      try {
        setReportsLoading(true);

        const res = await fetch(
          apiUrl(
            `/api/reports?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(deferredSearch)}`
          ),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        // If you haven't implemented GET /api/reports, this will fail silently and that's OK.
        const json = await res.json().catch(() => null);

        if (json?.success) setAllReports(json.data || []);
        else setAllReports([]);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setAllReports([]);
        }
      } finally {
        setReportsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [activeView, selectedCategory, deferredSearch, token]);

  // ---------------- Fetch Audit Trail ----------------
  useEffect(() => {
    if (activeView !== "audit") return;

    const controller = new AbortController();
    const run = async () => {
      try {
        setAuditLoading(true);
        const res = await fetch(
          apiUrl(
            `/api/audit?module=${encodeURIComponent(auditFilterModule)}&action=${encodeURIComponent(
              auditFilterAction
            )}&search=${encodeURIComponent(deferredAuditSearch)}&limit=200&offset=0`
          ),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        const json = await res.json();
        if (json?.success) {
          setAuditRows(json.data || []);
          setAuditTotal(json.total || 0);
        } else {
          setAuditRows([]);
          setAuditTotal(0);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setAuditRows([]);
          setAuditTotal(0);
        }
      } finally {
        setAuditLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [activeView, auditFilterModule, auditFilterAction, deferredAuditSearch, token]);

  // ---------------- Stats from auditRows ----------------
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return auditRows.filter((e) => (e.timestamp ? new Date(e.timestamp).toDateString() : "") === today).length;
  }, [auditRows]);

  const criticalCount = useMemo(() => {
    return auditRows.filter((e) => e.severity === "warning" || e.severity === "error" || e.severity === "critical").length;
  }, [auditRows]);

  const activeUsersCount = useMemo(() => new Set(auditRows.map((e) => e.userId)).size, [auditRows]);

  // ---------------- Actions ----------------
  const exportAuditTrail = () => {
    const url = apiUrl(
      `/api/audit/export?module=${encodeURIComponent(auditFilterModule)}&action=${encodeURIComponent(
        auditFilterAction
      )}&search=${encodeURIComponent(auditSearchTerm)}`
    );
    window.open(url, "_blank");
  };

  // Optional list actions (kept)
  const onView = (r) => console.log("View report:", r.title, r.id);
  const onDownload = (r) => console.log("Download report:", r.title, r.id);
  const onPrint = (r) => console.log("Print report:", r.title, r.id);
  const onShare = (r) => console.log("Share report:", r.title, r.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Alerts</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Generate reports and review the system audit trail.
            </p>
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

        {/* Content */}
        {activeView === "reports" ? (
          <ReportsView
            categories={categories}
            allReports={allReports}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onView={onView}
            onDownload={onDownload}
            onPrint={onPrint}
            onShare={onShare}
            loading={reportsLoading}
            reportType={reportType}
            setReportType={setReportType}
            reportFormat={reportFormat}
            setReportFormat={setReportFormat}
            generating={generating}
            generateReport={generateReport}
          />
        ) : (
          <AuditTrailView
            auditRows={auditRows}
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
            loading={auditLoading}
            totalCount={auditTotal}
          />
        )}
      </div>
    </div>
  );
}
