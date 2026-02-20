// src/components/Pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Activity,
  GraduationCap,
  BarChart3,
  Stethoscope,
  Award,
  PieChart as PieChartIcon,
} from "lucide-react";

// SEPARATED CHART COMPONENTS (Charts folder)
import { ChartContainer, BarChart, LineChart, AreaChart } from "../Charts";

// Recharts ONLY for the Pie charts
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/* ------------------- API helper ------------------- */
// If you create src/config/api.js, you can replace this with: import { apiUrl } from "../../config/api";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const apiUrl = (path) => `${API_BASE}${path}`;

/* ------------------- Tiny UI Helpers (no external UI lib) ------------------- */

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800
    hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div
    className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </h2>
);

const CardContent = ({ children, className = "" }) => <div className={`px-6 py-6 ${className}`}>{children}</div>;

const Badge = ({ children, variant = "solid", className = "" }) => {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm";
  const variants = {
    solid: "bg-gray-900 text-white border-transparent dark:bg-gray-100 dark:text-gray-900",
    outline:
      "bg-white text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
  };
  return (
    <span className={`${base} ${variants[variant] || ""} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = "solid", size = "md", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed dark:focus:ring-offset-gray-950";
  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-4.5 py-2.5",
  };
  const variants = {
    solid: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    outline:
      "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
    link: "text-blue-600 hover:text-blue-700 px-0 py-0",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Progress = ({ value = 0, className = "" }) => (
  <div className={`w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner ${className}`}>
    <div
      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all shadow-sm"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

/* ------------------------------ Helpers ------------------------------ */

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/35 dark:text-yellow-200 dark:border-yellow-900";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/35 dark:text-blue-200 dark:border-blue-900";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case "admission":
      return <Users className="h-4 w-4 text-green-600" />;
    case "health":
      return <Heart className="h-4 w-4 text-red-600" />;
    case "donation":
      return <DollarSign className="h-4 w-4 text-blue-600" />;
    case "milestone":
      return <TrendingUp className="h-4 w-4 text-purple-600" />;
    case "report":
      return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-300" />;
  }
};

// Pie label renderer (colored name + percent)
const RADIAN = Math.PI / 180;

const renderPieLabel = (labelKey) => (props) => {
  const { cx, cy, midAngle, outerRadius, payload } = props;

  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percent = payload.__percent ?? 0;

  return (
    <text
      x={x}
      y={y}
      fill={payload.color || "#111827"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: 18, fontWeight: 500 }}
    >
      {payload[labelKey]} {percent}%
    </text>
  );
};

// Utility to attach percent to pie data (for label display)
const withPercent = (data, valueKey) => {
  const sum = data.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0) || 1;
  return data.map((d) => ({
    ...d,
    __percent: Math.round(((Number(d[valueKey]) || 0) / sum) * 100),
  }));
};

// Safe number
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Format date-ish values from backend
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
};

// ✅ helper for education colors (no hardcoded palette required)
const pickBucketColor = (bucket) => {
  const b = String(bucket || "").toLowerCase();
  if (b.includes("95") || b.includes("100")) return "#10b981";
  if (b.includes("90")) return "#22c55e";
  if (b.includes("85")) return "#3b82f6";
  if (b.includes("80")) return "#6366f1";
  if (b.includes("75")) return "#f59e0b";
  if (b.includes("below")) return "#ef4444";
  if (b.includes("no grade")) return "#9ca3af";
  return "#3b82f6";
};

/* ------------------------------ Dashboard ------------------------------ */

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // overview
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // demographics
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [ageDistributionData, setAgeDistributionData] = useState([]);
  const [gradeDistributionData, setGradeDistributionData] = useState([]);
  const [genderData, setGenderData] = useState([]);

  // health
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState("");
  const [healthStatusData, setHealthStatusData] = useState([]);
  // ✅ Vaccinations removed

  // donations
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationsError, setDonationsError] = useState("");
  const [donationTrendsData, setDonationTrendsData] = useState([]);
  const [donorTypeData, setDonorTypeData] = useState([]);

  // development (optional from backend route)
  const [loadingDevelopment, setLoadingDevelopment] = useState(false);
  const [developmentError, setDevelopmentError] = useState("");
  const [developmentProgressData, setDevelopmentProgressData] = useState([]);
  const [developmentVsAcademicData, setDevelopmentVsAcademicData] = useState([]);

  // ✅ EDUCATION (REAL from backend)
  const [loadingEducation, setLoadingEducation] = useState(false);
  const [educationError, setEducationError] = useState("");
  const [educationLevelSummaryData, setEducationLevelSummaryData] = useState([]); // [{level,count}]
  const [avgByLevelData, setAvgByLevelData] = useState([]); // [{level,avg}]
  const [gradePerformanceData, setGradePerformanceData] = useState([]); // [{bucket,count}]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "demographics", label: "Demographics" },
    { id: "education", label: "Education" },
    { id: "development", label: "Development" },
    { id: "health", label: "Health" },
    { id: "donations", label: "Donations" },
  ];

  // ---------- Fetchers ----------
  const fetchOverview = async () => {
    setLoadingOverview(true);
    setOverviewError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/overview"));
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load overview");

      setStats(data.stats || null);
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setRecentActivities(Array.isArray(data.recentActivities) ? data.recentActivities : []);
    } catch (e) {
      console.error(e);
      setOverviewError(e.message || "Failed to load overview");
      setStats(null);
      setAlerts([]);
      setRecentActivities([]);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchDemographics = async () => {
    setLoadingDemo(true);
    setDemoError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/demographics"));
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load demographics");

      setAgeDistributionData(Array.isArray(data.ageDistribution) ? data.ageDistribution : []);
      setGradeDistributionData(Array.isArray(data.gradeDistribution) ? data.gradeDistribution : []);

      // add colors for pie slices
      const g = Array.isArray(data.genderDistribution) ? data.genderDistribution : [];
      const colored = g.map((row) => {
        const name = String(row.name || "");
        let color = "#3b82f6";
        if (name.toLowerCase().includes("female")) color = "#ec4899";
        if (name.toLowerCase().includes("male")) color = "#3b82f6";
        return { ...row, color };
      });
      setGenderData(colored);
    } catch (e) {
      console.error(e);
      setDemoError(e.message || "Failed to load demographics");
      setAgeDistributionData([]);
      setGradeDistributionData([]);
      setGenderData([]);
    } finally {
      setLoadingDemo(false);
    }
  };

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealthError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/health"));
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load health");

      // add colors for pie
      const raw = Array.isArray(data.healthStatusDistribution) ? data.healthStatusDistribution : [];
      const colored = raw.map((r) => {
        const s = String(r.status || "");
        let color = "#3b82f6";
        if (s.toLowerCase().includes("excellent")) color = "#10b981";
        else if (s.toLowerCase().includes("good")) color = "#3b82f6";
        else if (s.toLowerCase().includes("need")) color = "#f59e0b";
        else if (s.toLowerCase().includes("require")) color = "#ef4444";
        return { ...r, color };
      });

      setHealthStatusData(colored);
    } catch (e) {
      console.error(e);
      setHealthError(e.message || "Failed to load health");
      setHealthStatusData([]);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchDonations = async () => {
    setLoadingDonations(true);
    setDonationsError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/donations"));
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load donations");

      setDonationTrendsData(Array.isArray(data.donationTrends) ? data.donationTrends : []);

      // add colors for pie
      const raw = Array.isArray(data.donorTypeDistribution) ? data.donorTypeDistribution : [];
      const colored = raw.map((r) => {
        const t = String(r.type || "");
        let color = "#3b82f6";
        if (t.toLowerCase().includes("corporate")) color = "#8b5cf6";
        else if (t.toLowerCase().includes("foundation")) color = "#10b981";
        else if (t.toLowerCase().includes("one")) color = "#3b82f6";
        return { ...r, color };
      });

      setDonorTypeData(colored);
    } catch (e) {
      console.error(e);
      setDonationsError(e.message || "Failed to load donations");
      setDonationTrendsData([]);
      setDonorTypeData([]);
    } finally {
      setLoadingDonations(false);
    }
  };

  const fetchDevelopment = async () => {
    setLoadingDevelopment(true);
    setDevelopmentError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/development"));
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load development");

      // developmentProgress: [{category, progress}]
      const dp = Array.isArray(data.developmentProgress) ? data.developmentProgress : [];
      setDevelopmentProgressData(dp);

      const ms = Array.isArray(data.milestoneStatus) ? data.milestoneStatus : [];
      const fallback = ms.map((r) => ({
        name: r.name,
        academicScore: 0,
        count: r.count,
      }));
      setDevelopmentVsAcademicData(fallback);
    } catch (e) {
      console.error(e);
      setDevelopmentError(e.message || "Failed to load development");
      setDevelopmentProgressData([]);
      setDevelopmentVsAcademicData([]);
    } finally {
      setLoadingDevelopment(false);
    }
  };

  // ✅ NEW: Fetch Education analytics from backend
  const fetchEducation = async () => {
    setLoadingEducation(true);
    setEducationError("");
    try {
      const res = await fetch(apiUrl("/api/dashboard/education"));
      const data = await res.json();
      if (!res.ok || data?.success === false) throw new Error(data?.error || "Failed to load education analytics");

      // Education level summary
      const levelRows = Array.isArray(data.educationLevelSummary) ? data.educationLevelSummary : [];
      setEducationLevelSummaryData(
        levelRows.map((r) => ({
          level: r.level,
          count: num(r.count),
        }))
      );

      // Average grade per level
      const avgRows = Array.isArray(data.avgByLevel) ? data.avgByLevel : [];
      setAvgByLevelData(
        avgRows.map((r) => ({
          level: r.level,
          avg: num(r.avg),
        }))
      );

      // Grade performance buckets
      const bucketRows = Array.isArray(data.gradePerformance) ? data.gradePerformance : [];
      setGradePerformanceData(
        bucketRows.map((r) => ({
          bucket: r.bucket,
          count: num(r.count),
        }))
      );
    } catch (e) {
      console.error(e);
      setEducationError(e.message || "Failed to load education analytics");
      setEducationLevelSummaryData([]);
      setAvgByLevelData([]);
      setGradePerformanceData([]);
    } finally {
      setLoadingEducation(false);
    }
  };

  // ---------- initial load ----------
  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- on tab change, fetch if needed ----------
  useEffect(() => {
    if (activeTab === "demographics" && ageDistributionData.length === 0 && !loadingDemo && !demoError) {
      fetchDemographics();
    }
    if (activeTab === "health" && healthStatusData.length === 0 && !loadingHealth && !healthError) {
      fetchHealth();
    }
    if (activeTab === "donations" && donationTrendsData.length === 0 && !loadingDonations && !donationsError) {
      fetchDonations();
    }
    if (activeTab === "development" && developmentProgressData.length === 0 && !loadingDevelopment && !developmentError) {
      fetchDevelopment();
    }
    // ✅ education
    if (
      activeTab === "education" &&
      educationLevelSummaryData.length === 0 &&
      gradePerformanceData.length === 0 &&
      !loadingEducation &&
      !educationError
    ) {
      fetchEducation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- Derived values ----------
  const donationProgress = stats ? (num(stats.monthlyDonations) / Math.max(num(stats.donationGoal), 1)) * 100 : 0;
  const milestoneProgress = stats
    ? (num(stats.completedMilestones) / Math.max(num(stats.developmentMilestones), 1)) * 100
    : 0;

  // Pie data with percents
  const genderPie = useMemo(() => withPercent(genderData, "value"), [genderData]);
  const healthPie = useMemo(() => withPercent(healthStatusData, "count"), [healthStatusData]);
  const donorPie = useMemo(() => withPercent(donorTypeData, "value"), [donorTypeData]);

  // ✅ Education derived
  const avgOverall =
    avgByLevelData.length > 0
      ? avgByLevelData.reduce((acc, r) => acc + num(r.avg), 0) / Math.max(avgByLevelData.length, 1)
      : 0;

  const hasEducationData =
    educationLevelSummaryData.length > 0 || avgByLevelData.length > 0 || gradePerformanceData.length > 0;

  // Loading / error state for overview
  if (loadingOverview) return <div className="p-6">Loading dashboard...</div>;
  if (overviewError) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-red-600 font-semibold">Failed to load dashboard.</div>
        <div className="text-gray-700 dark:text-gray-300 text-sm">{overviewError}</div>
        <Button onClick={fetchOverview} className="w-fit">
          Retry
        </Button>
      </div>
    );
  }
  if (!stats) return <div className="p-6">No dashboard data available.</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Quick insights across children, health, development, and donations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Total Children
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{num(stats.totalChildren)}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  +{num(stats.newAdmissions)} new this month
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-2xl shadow-sm flex-shrink-0">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Health Records
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{num(stats.healthChecksDue)}</p>
                <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">Check-ups due</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 sm:p-4 rounded-2xl shadow-sm flex-shrink-0">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Total Donations
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ₱{num(stats.totalDonations).toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  ₱{num(stats.monthlyDonations).toLocaleString()} this month
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-sm flex-shrink-0">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Milestones
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {num(stats.completedMilestones)}/{num(stats.developmentMilestones)}
                </p>
                <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {milestoneProgress.toFixed(0)}% completed
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 sm:p-4 rounded-2xl shadow-sm flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-2 transition-colors">
          <div className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  "text-xs sm:text-sm font-semibold rounded-xl px-3 py-2.5 border transition " +
                  (activeTab === tab.id
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm " +
                      "dark:from-blue-950/40 dark:to-indigo-950/40 dark:text-blue-200 dark:border-blue-900"
                    : "bg-white text-gray-600 border-transparent hover:bg-gray-50 " +
                      "dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800")
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- OVERVIEW -------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Alerts */}
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-xl bg-orange-100 dark:bg-orange-950/40 p-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  Alerts &amp; Reminders
                </CardTitle>
                <Button size="sm" variant="outline" onClick={fetchOverview}>
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">No scheduled alerts.</div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4
                      bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl
                      hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                    >
                      <Badge className={`${getPriorityColor(alert.priority)} capitalize w-fit`}>
                        {alert.priority || "medium"}
                      </Badge>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(alert.date)}
                          </span>
                        </div>

                        {Array.isArray(alert.children) && alert.children.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alert.children.slice(0, 3).map((child, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {child}
                              </Badge>
                            ))}
                            {alert.children.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{alert.children.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <Button size="sm" variant="outline" onClick={() => navigate("/children/alerts")}>
                        View
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-xl bg-indigo-100 dark:bg-indigo-950/40 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  Progress Metrics
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Monthly Donation Goal</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ₱{num(stats.monthlyDonations).toLocaleString()} / ₱{num(stats.donationGoal).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={donationProgress} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{donationProgress.toFixed(0)}% of goal reached</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Development Milestones</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {num(stats.completedMilestones)} / {num(stats.developmentMilestones)}
                    </span>
                  </div>
                  <Progress value={milestoneProgress} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{milestoneProgress.toFixed(0)}% completed</p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/children")}>
                      Add Child
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => navigate("/children/reports")}>
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-100 dark:bg-blue-950/40 p-2">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">No recent activities yet.</div>
                ) : (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0
                      border-gray-100 dark:border-gray-800"
                    >
                      <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.action}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{formatDate(activity.time)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------- DEMOGRAPHICS -------------------- */}
      {activeTab === "demographics" && (
        <div className="space-y-6">
          {loadingDemo ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading demographics...</div>
          ) : demoError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{demoError}</div>
              <Button size="sm" variant="outline" onClick={fetchDemographics}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Age Distribution" icon={Users} height={300}>
                <BarChart data={ageDistributionData} xKey="ageGroup" bars={[{ key: "count", fill: "#3b82f6" }]} />
              </ChartContainer>

              <ChartContainer title="Children per Education Level" icon={GraduationCap} height={300}>
                <BarChart
                  data={gradeDistributionData}
                  xKey="grade"
                  xAngle={-45}
                  xHeight={80}
                  bars={[{ key: "count", fill: "#10b981" }]}
                />
              </ChartContainer>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-xl bg-purple-100 dark:bg-purple-950/40 p-2">
                      <PieChartIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    Gender Distribution
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={genderPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={renderPieLabel("name")}
                        >
                          {genderPie.map((entry, idx) => (
                            <Cell key={`gender-${idx}`} fill={entry.color || "#3b82f6"} />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-8">
                    {genderPie.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || "#3b82f6" }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Demographic Summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Children</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{num(stats.totalChildren)}</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Education Levels</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{gradeDistributionData.length}</p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gender Types</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{genderData.length}</p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">New Admissions</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">+{num(stats.newAdmissions)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* -------------------- EDUCATION (UPDATED REAL) -------------------- */}
      {activeTab === "education" && (
        <div className="space-y-6">
          {loadingEducation ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading education analytics...</div>
          ) : educationError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{educationError}</div>
              <Button size="sm" variant="outline" onClick={fetchEducation}>
                Retry
              </Button>
            </div>
          ) : !hasEducationData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-100 dark:bg-blue-950/40 p-2">
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No education analytics yet. Add Education Records per child (Education Level + Final Average) then refresh.
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={fetchEducation}>
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Education level summary */}
              <ChartContainer title="Students per Education Level" icon={GraduationCap} height={300}>
                <BarChart
                  data={educationLevelSummaryData.map((r) => ({ ...r, label: r.level }))}
                  xKey="label"
                  xAngle={-35}
                  xHeight={80}
                  bars={[{ key: "count", fill: "#3b82f6", name: "Students" }]}
                />
              </ChartContainer>

              {/* Chart 2: Grade performance distribution */}
              <ChartContainer title="Grade Performance Distribution (Final Average)" icon={BarChart3} height={300}>
                <BarChart
                  data={gradePerformanceData.map((r) => ({
                    bucket: r.bucket,
                    count: r.count,
                    fill: pickBucketColor(r.bucket),
                  }))}
                  xKey="bucket"
                  xAngle={-35}
                  xHeight={80}
                  // if your BarChart supports per-bar fill using "fillKey"
                  // it will use each row.fill; otherwise it falls back to solid fill below.
                  fillKey="fill"
                  bars={[{ key: "count", fill: "#10b981", name: "Students" }]}
                />
              </ChartContainer>

              {/* Chart 3: Average per level (optional) */}
              <ChartContainer title="Average Final Grade per Level" icon={TrendingUp} height={300}>
                <LineChart
                  data={avgByLevelData.map((r) => ({ ...r, label: r.level }))}
                  xKey="label"
                  lines={[{ key: "avg", stroke: "#6366f1", name: "Average (%)" }]}
                />
              </ChartContainer>

              {/* Summary cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Education Summary</CardTitle>
                  <Button size="sm" variant="outline" onClick={fetchEducation}>
                    Refresh
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Education Levels</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {educationLevelSummaryData.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Distinct levels recorded</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {avgOverall ? `${avgOverall.toFixed(2)}%` : "—"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">From available level records</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      This Education tab is based on each child’s <strong>Education Records</strong>:
                      <span className="block mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Education Level • School • Final Average • Honor/Recognition
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* -------------------- DEVELOPMENT -------------------- */}
      {activeTab === "development" && (
        <div className="space-y-6">
          {loadingDevelopment ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading development...</div>
          ) : developmentError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{developmentError}</div>
              <Button size="sm" variant="outline" onClick={fetchDevelopment}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-xl bg-purple-100 dark:bg-purple-950/40 p-2">
                      <Award className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    Development Progress by Category
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {developmentProgressData.length === 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">No milestone progress data yet.</div>
                  ) : (
                    developmentProgressData.map((category) => (
                      <div key={category.category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{category.category}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{num(category.progress)}%</span>
                        </div>
                        <Progress value={num(category.progress)} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <ChartContainer title="Milestone Status Breakdown" icon={BarChart3} height={300}>
                <BarChart data={developmentVsAcademicData} xKey="name" showLegend={false} bars={[{ key: "count", fill: "#8b5cf6", name: "Count" }]} />
              </ChartContainer>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Development Insights</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Milestones Completed</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{num(stats.completedMilestones)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total completed milestones</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Milestones</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{num(stats.developmentMilestones)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Across all categories</p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">{milestoneProgress.toFixed(0)}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed vs total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* -------------------- HEALTH -------------------- */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {loadingHealth ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading health...</div>
          ) : healthError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{healthError}</div>
              <Button size="sm" variant="outline" onClick={fetchHealth}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {/* Health Status Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-xl bg-red-100 dark:bg-red-950/35 p-2">
                      <Stethoscope className="h-5 w-5 text-red-600 dark:text-red-300" />
                    </div>
                    Health Status Overview
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={healthPie}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={renderPieLabel("status")}
                        >
                          {healthPie.map((entry, idx) => (
                            <Cell key={`health-${idx}`} fill={entry.color || "#3b82f6"} />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4">
                    {healthPie.map((entry) => (
                      <div key={entry.status} className="flex items-center gap-3">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || "#3b82f6" }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {entry.status}: {entry.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Health Summary</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Active Children</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{num(stats.totalChildren)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">From Overview</p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Health Status Types</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{healthStatusData.length}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Distinct statuses</p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Check-ups</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{num(stats.healthChecksDue)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Next 30 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* -------------------- DONATIONS -------------------- */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          {loadingDonations ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading donations...</div>
          ) : donationsError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{donationsError}</div>
              <Button size="sm" variant="outline" onClick={fetchDonations}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Monthly Donation Trends" icon={DollarSign} height={300}>
                <AreaChart
                  data={donationTrendsData}
                  xKey="month"
                  areas={[
                    {
                      key: "amount",
                      stroke: "#10b981",
                      fill: "#10b981",
                      fillOpacity: 0.3,
                      name: "Amount (₱)",
                    },
                  ]}
                />
              </ChartContainer>

              {/* Donor Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-xl bg-blue-100 dark:bg-blue-950/40 p-2">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    Donor Type Distribution
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={donorPie}
                          dataKey="value"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={(props) => {
                            const { cx, cy, midAngle, outerRadius, payload } = props;
                            const radius = outerRadius + 22;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill={payload.color || "#111827"}
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                style={{ fontSize: 18, fontWeight: 500 }}
                              >
                                {payload.__percent}%
                              </text>
                            );
                          }}
                        >
                          {donorPie.map((entry, idx) => (
                            <Cell key={`donor-${idx}`} fill={entry.color || "#3b82f6"} />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 space-y-3">
                    {donorPie.length === 0 ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">No donor type data yet.</div>
                    ) : (
                      donorPie.map((entry) => (
                        <div key={entry.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color || "#3b82f6" }} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{entry.type}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Donation Overview Cards */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Donation Overview</h2>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">₱{num(stats.totalDonations).toLocaleString()}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">All-time</p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₱{num(stats.monthlyDonations).toLocaleString()}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current month</p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Donation Goal</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">₱{num(stats.donationGoal).toLocaleString()}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Monthly goal</p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Goal Progress</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{donationProgress.toFixed(0)}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ₱{num(stats.monthlyDonations).toLocaleString()} / ₱{num(stats.donationGoal).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      <strong>Note:</strong> For detailed donation analytics including donor management, transaction history, and detailed reports, please visit the Donation Management module.
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    If your donation totals show 0, check your <code>donations.status</code> values. The backend query counts only <code>Paid</code> or <code>Success</code>.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;