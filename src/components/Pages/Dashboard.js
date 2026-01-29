import React, { useMemo, useState } from "react";
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

//  Recharts ONLY for the Pie charts
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-6 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "solid", className = "" }) => {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm";
  const variants = {
    solid:
      "bg-gray-900 text-white border-transparent dark:bg-gray-100 dark:text-gray-900",
    outline:
      "bg-white text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
  };
  return <span className={`${base} ${variants[variant] || ""} ${className}`}>{children}</span>;
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
  <div
    className={`w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner ${className}`}
  >
    <div
      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all shadow-sm"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

/* ------------------------------ Mock Data ------------------------------ */

const mockStats = {
  totalChildren: 45,
  newAdmissions: 3,
  healthChecksDue: 8,
  totalDonations: 125000,
  monthlyDonations: 15000,
  donationGoal: 20000,
  developmentMilestones: 156,
  completedMilestones: 134,
};

// Demographics Data
const ageDistributionData = [
  { ageGroup: "0-3 years", count: 8 },
  { ageGroup: "4-6 years", count: 12 },
  { ageGroup: "7-9 years", count: 10 },
  { ageGroup: "10-12 years", count: 9 },
  { ageGroup: "13-15 years", count: 4 },
  { ageGroup: "16-18 years", count: 2 },
];

const gradeDistributionData = [
  { grade: "Pre-school", count: 8 },
  { grade: "Grade 1", count: 6 },
  { grade: "Grade 2", count: 5 },
  { grade: "Grade 3", count: 7 },
  { grade: "Grade 4", count: 6 },
  { grade: "Grade 5", count: 5 },
  { grade: "Grade 6", count: 4 },
  { grade: "Grade 7", count: 3 },
  { grade: "Grade 8", count: 1 },
];

const genderData = [
  { name: "Male", value: 24, color: "#3b82f6" },
  { name: "Female", value: 21, color: "#ec4899" },
];

// Educational Analytics
const performanceTrendsData = [
  { month: "Jan", avgScore: 72, passingRate: 85 },
  { month: "Feb", avgScore: 75, passingRate: 87 },
  { month: "Mar", avgScore: 78, passingRate: 89 },
  { month: "Apr", avgScore: 76, passingRate: 88 },
  { month: "May", avgScore: 80, passingRate: 92 },
  { month: "Jun", avgScore: 82, passingRate: 94 },
];

const subjectPerformanceData = [
  { subject: "Math", avgScore: 78, improvement: 5 },
  { subject: "English", avgScore: 82, improvement: 3 },
  { subject: "Science", avgScore: 75, improvement: 8 },
  { subject: "Social Studies", avgScore: 80, improvement: 4 },
  { subject: "Arts", avgScore: 85, improvement: 2 },
];

// Developmental Progress
const developmentProgressData = [
  { category: "Physical", progress: 85 },
  { category: "Cognitive", progress: 78 },
  { category: "Emotional", progress: 82 },
  { category: "Social", progress: 88 },
  { category: "Language", progress: 80 },
];

const developmentVsAcademicData = [
  { name: "High Dev", academicScore: 85, count: 12 },
  { name: "Med Dev", academicScore: 75, count: 20 },
  { name: "Low Dev", academicScore: 65, count: 13 },
];

// Health Analytics
const healthStatusData = [
  { status: "Excellent", count: 18, color: "#10b981" },
  { status: "Good", count: 20, color: "#3b82f6" },
  { status: "Needs Check-up", count: 5, color: "#f59e0b" },
  { status: "Requires Attention", count: 2, color: "#ef4444" },
];

const vaccinationData = [
  { vaccine: "BCG", completed: 43, pending: 2 },
  { vaccine: "Polio", completed: 44, pending: 1 },
  { vaccine: "MMR", completed: 42, pending: 3 },
  { vaccine: "DPT", completed: 41, pending: 4 },
  { vaccine: "Hepatitis B", completed: 43, pending: 2 },
];

// Donation Analytics
const donationTrendsData = [
  { month: "Jan", amount: 12000, donors: 45 },
  { month: "Feb", amount: 14000, donors: 52 },
  { month: "Mar", amount: 13500, donors: 48 },
  { month: "Apr", amount: 15000, donors: 55 },
  { month: "May", amount: 16500, donors: 60 },
  { month: "Jun", amount: 15000, donors: 58 },
];

const donorTypeData = [
  { type: "Individual", value: 60, color: "#3b82f6" },
  { type: "Corporate", value: 30, color: "#8b5cf6" },
  { type: "Foundation", value: 10, color: "#10b981" },
];

const mockAlerts = [
  {
    id: 1,
    type: "health",
    priority: "high",
    message: "Health check-up due for Sarah M. and 2 others",
    date: "2025-09-05",
    children: ["Sarah M.", "John D.", "Maria L."],
  },
  {
    id: 2,
    type: "education",
    priority: "medium",
    message: "School enrollment deadline approaching",
    date: "2025-09-10",
    children: ["Alex P.", "Emma R."],
  },
  {
    id: 3,
    type: "milestone",
    priority: "low",
    message: "Development milestone updates needed",
    date: "2025-09-08",
    children: ["David K.", "Lisa S.", "Tom W."],
  },
];

const recentActivities = [
  { id: 1, action: "New child admission", user: "Sarah Johnson", time: "2 hours ago", type: "admission" },
  { id: 2, action: "Health record updated", user: "Dr. Michael Chen", time: "4 hours ago", type: "health" },
  { id: 3, action: "Donation received", user: "System", time: "6 hours ago", type: "donation" },
  { id: 4, action: "Development milestone completed", user: "Emily Rodriguez", time: "8 hours ago", type: "milestone" },
  { id: 5, action: "Report generated", user: "Sarah Johnson", time: "1 day ago", type: "report" },
];

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

/* ------------------------------ Dashboard ------------------------------ */

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const donationProgress = (mockStats.monthlyDonations / mockStats.donationGoal) * 100;
  const milestoneProgress = (mockStats.completedMilestones / mockStats.developmentMilestones) * 100;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "demographics", label: "Demographics" },
    { id: "education", label: "Education" },
    { id: "development", label: "Development" },
    { id: "health", label: "Health" },
    { id: "donations", label: "Donations" },
  ];

  // Attach percents for the Pie labels (does NOT change your original values)
  const genderPie = useMemo(() => withPercent(genderData, "value"), []);
  const healthPie = useMemo(() => withPercent(healthStatusData, "count"), []);
  const donorPie = useMemo(() => withPercent(donorTypeData, "value"), []);

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
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{mockStats.totalChildren}</p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  +{mockStats.newAdmissions} new this month
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
                  Health Alerts
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{mockStats.healthChecksDue}</p>
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
                  ${mockStats.totalDonations.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  ${mockStats.monthlyDonations.toLocaleString()} this month
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
                  {mockStats.completedMilestones}/{mockStats.developmentMilestones}
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
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-4
                    bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl
                    hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                  >
                    <Badge className={`${getPriorityColor(alert.priority)} capitalize w-fit`}>
                      {alert.priority}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{alert.date}</span>
                      </div>

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
                    </div>

                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
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
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Monthly Donation Goal
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ${mockStats.monthlyDonations.toLocaleString()} / ${mockStats.donationGoal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={donationProgress} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {donationProgress.toFixed(0)}% of goal reached
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Development Milestones
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mockStats.completedMilestones} / {mockStats.developmentMilestones}
                    </span>
                  </div>
                  <Progress value={milestoneProgress} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {milestoneProgress.toFixed(0)}% completed
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Add Child
                    </Button>
                    <Button size="sm" variant="outline">
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
                {recentActivities.map((activity) => (
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
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------- DEMOGRAPHICS -------------------- */}
      {activeTab === "demographics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Age Distribution" icon={Users} height={300}>
              <BarChart data={ageDistributionData} xKey="ageGroup" bars={[{ key: "count", fill: "#3b82f6" }]} />
            </ChartContainer>

            <ChartContainer title="Children per Grade Level" icon={GraduationCap} height={300}>
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
                        label={renderPieLabel("name", "value")}
                      >
                        {genderPie.map((entry, idx) => (
                          <Cell key={`gender-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-8">
                  {genderPie.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Age</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">8.5 years</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Most Common Grade</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">Grade 3</p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Youngest Child</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">6 months</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Oldest Child</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">17 years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- EDUCATION -------------------- */}
      {activeTab === "education" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Academic Performance Trends" icon={TrendingUp} height={300}>
              <LineChart
                data={performanceTrendsData}
                xKey="month"
                lines={[
                  { key: "avgScore", stroke: "#3b82f6", name: "Average Score" },
                  { key: "passingRate", stroke: "#10b981", name: "Passing Rate %" },
                ]}
              />
            </ChartContainer>

            <ChartContainer title="Subject Performance" icon={BarChart3} height={300}>
              <BarChart
                data={subjectPerformanceData}
                xKey="subject"
                xAngle={-45}
                xHeight={80}
                bars={[{ key: "avgScore", fill: "#10b981", name: "Average Score" }]}
              />
            </ChartContainer>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Educational Performance Summary</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {subjectPerformanceData.map((subject) => (
                    <div
                      key={subject.subject}
                      className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl
                      bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{subject.subject}</h4>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{subject.avgScore}%</p>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300 font-medium">+{subject.improvement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- DEVELOPMENT -------------------- */}
      {activeTab === "development" && (
        <div className="space-y-6">
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
                {developmentProgressData.map((category) => (
                  <div key={category.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category.progress}%</span>
                    </div>
                    <Progress value={category.progress} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <ChartContainer title="Development vs Academic Correlation" icon={BarChart3} height={300}>
              <BarChart
                data={developmentVsAcademicData}
                xKey="name"
                showLegend
                bars={[
                  { key: "academicScore", fill: "#8b5cf6", name: "Academic Score" },
                  { key: "count", fill: "#06b6d4", name: "Number of Children" },
                ]}
              />
            </ChartContainer>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Development Insights</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Progress</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">82.6%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Average across all categories</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Highest Category</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">Social (88%)</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Best performing area</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Needs Focus</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">Cognitive (78%)</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Area for improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- HEALTH -------------------- */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Status Overview */}
            <Card>
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
                        label={renderPieLabel("status", "count")}
                      >
                        {healthPie.map((entry, idx) => (
                          <Cell key={`health-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend bottom (2 columns) */}
                <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4">
                  {healthPie.map((entry) => (
                    <div key={entry.status} className="flex items-center gap-3">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {entry.status}: {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ChartContainer title="Vaccination Coverage" icon={Heart} height={300}>
              <BarChart
                data={vaccinationData}
                xKey="vaccine"
                showLegend
                bars={[
                  { key: "completed", fill: "#10b981", name: "Completed", stackId: "a" },
                  { key: "pending", fill: "#f59e0b", name: "Pending", stackId: "a" },
                ]}
              />
            </ChartContainer>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Healthy Children</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">38/45</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">84% of total</p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vaccination Rate</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">94%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Above target</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Check-ups</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">8</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Due this month</p>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requires Attention</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">2</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Immediate care needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* -------------------- DONATIONS -------------------- */}
      {activeTab === "donations" && (
        <div className="space-y-6">
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
                    name: "Amount ($)",
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
                              fill={payload.color}
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
                          <Cell key={`donor-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="mt-6 space-y-3">
                  {donorPie.map((entry) => (
                    <div key={entry.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{entry.type}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Donation Overview Cards */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Donation Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total This Year</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">$86,000</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Up 12% from last year</p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Donation</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">$285</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Per donor</p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Donors</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">318</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Active donors</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Goal</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">75%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">$15K / $20K</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    <strong>Note:</strong> For detailed donation analytics including donor management, transaction
                    history, and detailed reports, please visit the Donation Management module.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
