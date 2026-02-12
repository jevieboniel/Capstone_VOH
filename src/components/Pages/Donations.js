    import React, { useEffect, useMemo, useState } from "react";
    import { auditLogger } from "../../utils/auditLogger";

    import {
    DollarSign,
    Search,
    Download,
    Calendar,
    TrendingUp,
    Users,
    Heart,
    Target,
    Gift,
    Bell,
    CheckCircle,
    } from "lucide-react";

    import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    } from "recharts";

    import Button from "../UI/Button";

    /* ------------------------------ UI helpers ------------------------------ */

    const Card = ({ children, className = "" }) => (
    <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 ${className}`}
    >
        {children}
    </div>
    );

    const CardHeader = ({ children, className = "" }) => (
    <div
        className={`px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 ${className}`}
    >
        {children}
    </div>
    );

    const CardTitle = ({ children, className = "" }) => (
    <h2 className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
        {children}
    </h2>
    );

    const CardContent = ({ children, className = "" }) => <div className={`px-5 py-5 ${className}`}>{children}</div>;

    const Badge = ({ className = "", children }) => (
    <span
        className={
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
        "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 " +
        "border-gray-300 dark:border-gray-700 " +
        className
        }
    >
        {children}
    </span>
    );

    const Input = ({ className = "", ...props }) => (
    <input
        className={
        "w-full rounded-lg border border-gray-300 dark:border-gray-700 " +
        "bg-white dark:bg-gray-900 " +
        "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 " +
        "px-4 py-2 text-sm outline-none " +
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
        className
        }
        {...props}
    />
    );

    const Progress = ({ value = 0 }) => (
    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner">
        <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 transition-all shadow-lg"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
    </div>
    );

    /* ------------------------------ Helpers ------------------------------ */

    const getTypeColor = (type) => {
    switch (type) {
        case "Monthly":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900";
        case "Weekly":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900";
        case "One-time":
        default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
    };

    const formatCurrency = (amount, currency) => {
    const symbols = { USD: "$", EUR: "€", PHP: "₱", KES: "KSh", GBP: "£" };
    return `${symbols[currency] || currency} ${Number(amount).toLocaleString()}`;
    };

    const fmtPeso = (amount) => `₱${Number(amount).toLocaleString()}`;

    const UiButton = ({ variant = "primary", size = "medium", className = "", ...props }) => (
    <Button variant={variant} size={size} className={className} {...props} />
    );

    const API_BASE = "http://localhost:5000";

    /* ✅ ALWAYS SAFE METRICS SHAPE */
    const EMPTY_METRICS = {
    totals: { totalAmount: 0, totalTransactions: 0, recurringDonors: 0 },
    trend: [],
    purposes: [],
    recent: [],
    };

    const normalizeMetrics = (data) => ({
    totals: {
        totalAmount: Number(data?.totals?.totalAmount ?? 0),
        totalTransactions: Number(data?.totals?.totalTransactions ?? 0),
        recurringDonors: Number(data?.totals?.recurringDonors ?? 0),
    },
    trend: Array.isArray(data?.trend) ? data.trend : [],
    purposes: Array.isArray(data?.purposes) ? data.purposes : [],
    recent: Array.isArray(data?.recent) ? data.recent : [],
    });

    /* ------------------------------ Component ------------------------------ */

    export default function DonationManagement({ userRole, currentUser }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("overview");

    const [donations, setDonations] = useState([]);
    const [metrics, setMetrics] = useState(EMPTY_METRICS);

    const [metricsLoading, setMetricsLoading] = useState(false);
    const [donationsLoading, setDonationsLoading] = useState(false);

    // ✅ helper: authenticated fetch (because backend uses verifyToken)
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem("admin_token");
        const headers = {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        };

        // Only set JSON header when body is not FormData
        if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        }

        return fetch(url, { ...options, headers });
    };

    // ✅ Fetch metrics for Overview (SAFE + AUTH)
    useEffect(() => {
        let alive = true;

        (async () => {
        try {
            setMetricsLoading(true);

            const res = await authFetch(`${API_BASE}/api/donations/metrics`);
            const data = await res.json().catch(() => ({}));

            if (!alive) return;

            if (!res.ok) {
            console.error("metrics fetch failed:", data);
            setMetrics(EMPTY_METRICS);
            return;
            }

            setMetrics(normalizeMetrics(data));
        } catch (e) {
            console.error("metrics fetch error:", e);
            if (alive) setMetrics(EMPTY_METRICS);
        } finally {
            if (alive) setMetricsLoading(false);
        }
        })();

        return () => {
        alive = false;
        };
    }, []);

    // ✅ Fetch donation list for Donations tab (SAFE + AUTH)
    useEffect(() => {
        let alive = true;

        (async () => {
        try {
            setDonationsLoading(true);

            const url = `${API_BASE}/api/donations?q=${encodeURIComponent(searchTerm)}`;
            const res = await authFetch(url);
            const data = await res.json().catch(() => []);

            if (!alive) return;

            if (!res.ok) {
            console.error("donations fetch failed:", data);
            setDonations([]);
            return;
            }

            // backend returns array rows
            setDonations(Array.isArray(data) ? data : data?.donations || []);
        } catch (e) {
            console.error("donations fetch error:", e);
            if (alive) setDonations([]);
        } finally {
            if (alive) setDonationsLoading(false);
        }
        })();

        return () => {
        alive = false;
        };
    }, [searchTerm]);

    const filteredDonations = useMemo(() => donations, [donations]);

    // ✅ SAFE destructure (never crashes)
    const totals = metrics?.totals || EMPTY_METRICS.totals;
    const totalDonations = totals.totalAmount;
    const totalTransactions = totals.totalTransactions;
    const recurringDonors = totals.recurringDonors;

    // Keep your thesis “goal” numbers
    const monthlyGoal = 20000;
    const currentMonthTotal = totalDonations;
    const goalProgress = monthlyGoal ? (currentMonthTotal / monthlyGoal) * 100 : 0;

    // Export from backend (AUTH so it doesn't download an HTML error page)
    // Export from backend (AUTH REQUIRED)
    const handleExportData = async () => {
    try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
        alert("Not logged in.");
        return;
        }

        const url = `${API_BASE}/api/donations/export.csv?q=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Export failed");
        }

        const blob = await res.blob();

        // Try to read filename from Content-Disposition
        const cd = res.headers.get("content-disposition") || "";
        const match = cd.match(/filename="?([^"]+)"?/i);
        const filename = match?.[1] || "donations_export.csv";

        // Trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);

        if (currentUser) {
        auditLogger.logView(
            currentUser,
            "Donation Export",
            `Exported donation records`,
            "Donation Management",
            "export_donations"
        );
        }
    } catch (e) {
        console.error(e);
        alert(e.message || "Export failed.");
    }
    };
    
    // Recharts theme helpers
    const axisTickClass = "fill-gray-500 dark:fill-gray-400";
    const gridStroke = "rgba(148,163,184,0.35)";
    const tooltipStyle = {
        background: "rgba(17,24,39,0.95)",
        border: "1px solid rgba(55,65,81,1)",
        borderRadius: 12,
        color: "#fff",
    };

    const PIE_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#14b8a6", "#f97316", "#a855f7"];

    const OverviewView = () => (
        <div className="space-y-6">
        {/* Recent Donations */}
        <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/30 shadow-lg">
            <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-5">
                <div className="shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-200 mb-1">
                    Recent Donations Received
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Latest contributions from our supporters</p>
                </div>
            </div>

            {metricsLoading ? (
                <div className="text-sm text-gray-700 dark:text-gray-200">Loading metrics...</div>
            ) : (
                <div className="space-y-3">
                {(metrics.recent || []).map((donation) => (
                    <div
                    key={donation.id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-gray-700 transition-all duration-200"
                    >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            {donation.donor_name || "Anonymous Donor"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900">
                                {donation.method || "PayMongo"}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {donation.purpose || "Donation"}
                            </span>
                            </div>
                        </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="font-bold text-lg sm:text-xl text-blue-900 dark:text-blue-200">
                            {formatCurrency(donation.amount, donation.currency)}
                        </span>
                        </div>
                    </div>
                    </div>
                ))}
                {(!metrics.recent || metrics.recent.length === 0) && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">No completed donations yet.</div>
                )}
                </div>
            )}
            </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500 dark:border-l-green-400">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Total Donations
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {fmtPeso(totalDonations)}
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Based on completed payments
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Transactions
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {totalTransactions}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {recurringDonors} monthly donors
                    </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Monthly Goal
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {fmtPeso(currentMonthTotal)}
                    </p>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {goalProgress.toFixed(0)}% achieved
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500 dark:border-l-orange-400">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Avg Donation
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {fmtPeso(totalTransactions ? Math.round(totalDonations / totalTransactions) : 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">Per transaction</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/30 dark:via-gray-900 dark:to-blue-950/20 border-purple-200 dark:border-gray-800 shadow-lg">
            <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-2.5 rounded-xl shadow-md">
                <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl">Goal Progress</span>
            </CardTitle>

            <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/40 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-900">
                {fmtPeso(currentMonthTotal)} / {fmtPeso(monthlyGoal)}
            </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
                <Progress value={goalProgress} />
                <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{goalProgress.toFixed(0)}% Complete</span>
                <span className="text-purple-600 dark:text-purple-300 font-semibold">
                    Exceeded by {fmtPeso(Math.max(currentMonthTotal - monthlyGoal, 0))}
                </span>
                </div>
            </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donation Trends */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                Donation Trends
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={{ className: axisTickClass }} />
                    <YAxis tick={{ className: axisTickClass }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [
                        name === "amount" ? `₱${Number(value).toLocaleString()}` : value,
                        name === "amount" ? "Amount" : "Donors",
                        ]}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>

            {/* Donation Purposes */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                Donation Purposes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={metrics.purposes || []} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={4} dataKey="value">
                        {(metrics.purposes || []).map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Percentage"]} />
                    </PieChart>
                </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-3">
                {(metrics.purposes || []).map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}%</span>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );

    const DonationsView = () => (
        <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                All Donations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and track all donation records</p>
            </div>

            <UiButton
            variant="outline"
            size="medium"
            onClick={handleExportData}
            className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800"
            >
            <Download className="h-4 w-4" />
            Export CSV
            </UiButton>
        </div>

        <Card className="shadow-md">
            <CardContent className="p-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                placeholder="🔍 Search by purpose or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-blue-400 dark:focus:border-blue-500"
                />
            </div>
            </CardContent>
        </Card>

        {donationsLoading ? (
            <div className="text-sm text-gray-700 dark:text-gray-200">Loading donations...</div>
        ) : (
            <div className="space-y-4">
            {filteredDonations.map((donation) => {
                const dt = donation.created_at ? new Date(donation.created_at) : null;
                const dateText = dt ? dt.toLocaleDateString() : "-";
                const timeText = dt ? dt.toLocaleTimeString() : "-";

                return (
                <Card
                    key={donation.id}
                    className="hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                >
                    <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4 sm:items-center flex-1 min-w-0">
                        <div className="shrink-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-3.5 shadow-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg mb-1">
                            {donation.donor_name || "Anonymous Donor"}
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
                                <span className="font-medium">
                                {dateText} • {timeText}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {donation.paymongo_payment_id || donation.paymongo_payment_intent_id || "-"}
                                </span>
                            </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900 font-semibold">
                                {donation.method || "PayMongo"}
                            </Badge>
                            <span className="text-xs text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium">
                                {donation.purpose || "Donation"}
                            </span>
                            </div>
                        </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                            {formatCurrency(donation.amount, donation.currency)}
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${getTypeColor(
                                donation.type
                            )}`}
                            >
                            {donation.type}
                            </span>
                            <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                                donation.status === "Completed"
                                ? "border-green-300 dark:border-green-900 bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200"
                                : donation.status === "Failed"
                                ? "border-red-300 dark:border-red-900 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200"
                                : "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            }`}
                            >
                            {donation.status}
                            </span>
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                );
            })}

            {filteredDonations.length === 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-300">No donations found.</div>
            )}
            </div>
        )}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen space-y-6 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Donation Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track and analyze donations received through payment gateway
            </p>
            </div>

            <div className="flex gap-2">
            <UiButton
                variant={activeView === "overview" ? "primary" : "outline"}
                size="medium"
                onClick={() => setActiveView("overview")}
            >
                Overview
            </UiButton>

            <UiButton
                variant={activeView === "donations" ? "primary" : "outline"}
                size="medium"
                onClick={() => setActiveView("donations")}
            >
                Donations
            </UiButton>
            </div>
        </div>

        {/* Content */}
        {activeView === "overview" && <OverviewView />}
        {activeView === "donations" && <DonationsView />}
        </div>
    );
    }
