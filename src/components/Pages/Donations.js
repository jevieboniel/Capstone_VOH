    import React, { useMemo, useState } from "react";
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

    // ✅ Use your UI Button
    import Button from "../UI/Button";

    /* ------------------------------ Dashboard-like UI helpers ------------------------------ */

    const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        {children}
    </div>
    );

    const CardHeader = ({ children, className = "" }) => (
    <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2 ${className}`}>
        {children}
    </div>
    );

    const CardTitle = ({ children, className = "" }) => (
    <h2 className={`text-base sm:text-lg font-semibold text-gray-900 ${className}`}>{children}</h2>
    );

    const CardContent = ({ children, className = "" }) => (
    <div className={`px-5 py-5 ${className}`}>{children}</div>
    );

    const Badge = ({ className = "", children }) => (
    <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-white text-gray-700 border-gray-300 ${className}`}
    >
        {children}
    </span>
    );

    const Input = ({ className = "", ...props }) => (
    <input
        className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        {...props}
    />
    );

    const Progress = ({ value = 0 }) => (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
        className="h-full rounded-full bg-blue-500 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
    </div>
    );

    /* ------------------------------ Mock Data ------------------------------ */

    const mockDonations = [
    {
        id: 1,
        amount: 500,
        currency: "USD",
        date: "2025-09-03",
        time: "14:23:45",
        type: "One-time",
        purpose: "Education Support",
        method: "Credit Card",
        paymentId: "pay_xyz123abc",
        status: "Completed",
    },
    {
        id: 2,
        amount: 2500,
        currency: "PHP",
        date: "2025-10-07",
        time: "10:15:32",
        type: "One-time",
        purpose: "General Support",
        method: "GCash",
        paymentId: "pay_abc789xyz",
        status: "Completed",
    },
    {
        id: 3,
        amount: 1000,
        currency: "PHP",
        date: "2025-10-06",
        time: "16:45:20",
        type: "One-time",
        purpose: "Healthcare",
        method: "GCash",
        paymentId: "pay_def456ghi",
        status: "Completed",
    },
    {
        id: 4,
        amount: 750,
        currency: "USD",
        date: "2025-10-05",
        time: "09:30:15",
        type: "Monthly",
        purpose: "Food & Nutrition",
        method: "Credit Card",
        paymentId: "pay_ghi123jkl",
        recurring: true,
        status: "Completed",
    },
    {
        id: 5,
        amount: 5000,
        currency: "PHP",
        date: "2025-10-04",
        time: "13:20:50",
        type: "One-time",
        purpose: "Infrastructure",
        method: "Bank Transfer",
        paymentId: "pay_jkl456mno",
        status: "Completed",
    },
    ];

    const mockDonationTrends = [
    { month: "Jan", amount: 12000, donors: 45 },
    { month: "Feb", amount: 15000, donors: 52 },
    { month: "Mar", amount: 18000, donors: 60 },
    { month: "Apr", amount: 14000, donors: 48 },
    { month: "May", amount: 20000, donors: 67 },
    { month: "Jun", amount: 25000, donors: 78 },
    { month: "Jul", amount: 22000, donors: 71 },
    { month: "Aug", amount: 28000, donors: 85 },
    { month: "Sep", amount: 32000, donors: 92 },
    ];

    const purposeData = [
    { name: "Education Support", value: 35, color: "#3b82f6" },
    { name: "Healthcare", value: 25, color: "#ef4444" },
    { name: "Food & Nutrition", value: 20, color: "#10b981" },
    { name: "Infrastructure", value: 12, color: "#f59e0b" },
    { name: "General Support", value: 8, color: "#8b5cf6" },
    ];

    const monthlyGoal = 20000;
    const currentMonthTotal = 32000;

    /* ------------------------------ Helpers ------------------------------ */

    const getTypeColor = (type) => {
    switch (type) {
        case "Monthly":
        return "bg-blue-100 text-blue-800 border-blue-200";
        case "Weekly":
        return "bg-green-100 text-green-800 border-green-200";
        case "One-time":
        default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
    };

    const formatCurrency = (amount, currency) => {
    const symbols = { USD: "$", EUR: "€", PHP: "₱", KES: "KSh", GBP: "£" };
    return `${symbols[currency] || currency} ${Number(amount).toLocaleString()}`;
    };

    const fmtPeso = (amount) => `₱${Number(amount).toLocaleString()}`;

    // Map your UI Button variants to the design used across pages
    const UiButton = ({ variant = "primary", size = "medium", className = "", ...props }) => (
    <Button variant={variant} size={size} className={className} {...props} />
    );

    /* ------------------------------ Component ------------------------------ */

    export default function DonationManagement({ userRole, currentUser }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("overview");

    const filteredDonations = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return mockDonations.filter(
        (d) => d.purpose.toLowerCase().includes(q) || d.method.toLowerCase().includes(q)
        );
    }, [searchTerm]);

    const totalDonations = useMemo(() => mockDonations.reduce((sum, d) => sum + d.amount, 0), []);
    const totalTransactions = mockDonations.length;
    const recurringDonors = useMemo(() => mockDonations.filter((d) => d.recurring).length, []);
    const goalProgress = (currentMonthTotal / monthlyGoal) * 100;

    const handleExportData = () => {
        const csvContent = [
        ["Payment ID", "Amount", "Currency", "Date", "Time", "Purpose", "Method", "Status"],
        ...filteredDonations.map((d) => [
            d.paymentId,
            d.amount,
            d.currency,
            d.date,
            d.time,
            d.purpose,
            d.method,
            d.status,
        ]),
        ]
        .map((row) => row.join(","))
        .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "donations_export.csv";
        a.click();
        URL.revokeObjectURL(url);

        if (currentUser) {
        auditLogger.logView(
            currentUser,
            "Donation Export",
            `Exported ${filteredDonations.length} donation records`,
            "Donation Management",
            "export_donations"
        );
        }
    };

    const OverviewView = () => (
        <div className="space-y-6">
        {/* Recent Donations */}
        <Card className="border-blue-200 bg-blue-50">
            <CardContent>
            <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-full bg-blue-600 p-3">
                <Bell className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                <div className="text-sm sm:text-base font-semibold text-blue-900">
                    Recent Donations Received
                </div>

                <div className="mt-4 space-y-3">
                    {mockDonations.slice(0, 3).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex min-w-0 items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="truncate text-gray-800">Anonymous Donor</span>
                        <Badge className="text-xs">{donation.method}</Badge>
                        </div>
                        <span className="shrink-0 font-semibold text-blue-900">
                        {formatCurrency(donation.amount, donation.currency)}
                        </span>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{fmtPeso(totalDonations)}</p>
                    <p className="text-xs sm:text-sm text-green-600">+15% from last month</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTransactions}</p>
                    <p className="text-xs sm:text-sm text-blue-600">{recurringDonors} recurring</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Goal</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{fmtPeso(currentMonthTotal)}</p>
                    <p className="text-xs sm:text-sm text-purple-600">{goalProgress.toFixed(0)}% of goal</p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Donation</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {fmtPeso(Math.round(totalDonations / mockDonations.length))}
                    </p>
                    <p className="text-xs sm:text-sm text-orange-600">Per transaction</p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-900" />
                October 2025 Goal Progress
            </CardTitle>

            <div className="text-sm sm:text-base font-semibold text-blue-600">
                {fmtPeso(currentMonthTotal)} / {fmtPeso(monthlyGoal)}
            </div>
            </CardHeader>

            <CardContent className="space-y-3">
            <Progress value={goalProgress} />
            <p className="text-xs sm:text-sm text-gray-600">
                {goalProgress.toFixed(0)}% complete • Exceeded by{" "}
                {fmtPeso(Math.max(currentMonthTotal - monthlyGoal, 0))}
            </p>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donation Trends */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-900" />
                Donation Trends
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockDonationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
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
                <Gift className="h-5 w-5 text-gray-900" />
                Donation Purposes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={purposeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                    >
                        {purposeData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    </PieChart>
                </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-3">
                {purposeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h2 className="text-xl font-semibold text-gray-900">All Donations</h2>
            <p className="text-sm text-gray-600">View and track all donation records</p>
            </div>

            <UiButton variant="outline" size="medium" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
            </UiButton>
        </div>

        <Card>
            <CardContent>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                placeholder="Search by purpose or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
            </div>
            </CardContent>
        </Card>

        <div className="space-y-4">
            {filteredDonations.map((donation) => (
            <Card key={donation.id}>
                <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4 sm:items-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="min-w-0">
                        <div className="font-medium text-gray-900">Anonymous Donor</div>

                        <div className="mt-1 flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                            {new Date(donation.date).toLocaleDateString()} {donation.time}
                            </span>
                        </div>
                        <div className="truncate">Payment ID: {donation.paymentId}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className="text-xs">{donation.method}</Badge>
                        <span className="text-xs text-gray-600">{donation.purpose}</span>
                        </div>
                    </div>
                    </div>

                    <div className="text-left sm:text-right">
                    <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(donation.amount, donation.currency)}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getTypeColor(donation.type)}`}>
                        {donation.type}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        {donation.status}
                        </span>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donation Management</h1>
            <p className="mt-1 text-sm text-gray-600">Track and analyze donations received through payment gateway</p>
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
