    // src/Modals/DevelopmentSummaryModal.jsx
    import React, { useEffect, useMemo, useState } from "react";
    import { X } from "lucide-react";

    const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Number(n || 0)));

    const ProgressBar = ({ value }) => {
    const v = clamp(value);
    return (
        <div className="w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 h-2.5">
        <div className="h-full bg-gray-900 dark:bg-gray-100" style={{ width: `${v}%` }} />
        </div>
    );
    };

    const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
    };

    const statusPill = (status) => {
    if (status === "Completed")
        return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-900";
    if (status === "In Progress")
        return "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900";
    if (status === "At Risk")
        return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900";
    return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700";
    };

    /**
     * ✅ IMPORTANT:
     * Your Development.js and your API are not using perfectly consistent field names.
     * This normalizer makes sure THIS modal calculates stats from the exact same fields
     * Development.js uses (childId, category, milestone/title, progress, status, targetDate, notes, objectives).
     */
    const normalizeMilestone = (m) => {
    const progress = clamp(Number(m.progress ?? m.percent ?? m.percentage ?? m.completion ?? 0));

    return {
        ...m,
        id: m.id ?? m._id,
        // childId can come in multiple ways
        childId: Number(m.childId ?? m.child_id ?? m.childID ?? m.child ?? 0),
        category: m.category ?? "Other",
        // Development.js displays m.milestone
        milestone: m.milestone ?? m.title ?? m.name ?? "",
        // DevelopmentSummaryModal displays m.title
        title: m.title ?? m.milestone ?? m.name ?? "",
        description: m.description ?? "",
        progress,
        status: m.status ?? "Planned",
        targetDate: m.targetDate ?? m.target_date ?? null,
        notes: m.notes ?? "",
        objectives: Array.isArray(m.objectives) ? m.objectives : [],
    };
    };

    const byCatAvg = (list, cat) => {
    const items = list.filter((m) => m.category === cat);
    if (!items.length) return 0;
    return Math.round(items.reduce((s, m) => s + clamp(m.progress), 0) / items.length);
    };

    export default function DevelopmentSummaryModal({ child, token, onClose }) {
    const API_MILESTONES = "http://localhost:5000/api/milestones";

    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const run = async () => {
        if (!child?.id) return;
        try {
            setLoading(true);

            const res = await fetch(`${API_MILESTONES}?childId=${child.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => ({}));
            const raw = Array.isArray(data) ? data : data?.milestones || [];

            if (!mounted) return;

            const normalized = raw
            .map(normalizeMilestone)
            .filter((m) => Number(m.childId) === Number(child.id));

            setMilestones(normalized);
        } catch (e) {
            console.error("Fetch milestones for child failed:", e);
            if (mounted) setMilestones([]);
        } finally {
            if (mounted) setLoading(false);
        }
        };

        run();
        return () => {
        mounted = false;
        };
    }, [child?.id, token]);

    const stats = useMemo(() => {
        const total = milestones.length;
        const completed = milestones.filter((m) => m.status === "Completed").length;
        const inProgress = milestones.filter((m) => m.status === "In Progress").length;

        const overall = total
        ? Math.round(milestones.reduce((s, m) => s + clamp(m.progress), 0) / total)
        : 0;

        return {
        overall: clamp(overall),
        total,
        completed,
        inProgress,
        physical: byCatAvg(milestones, "Physical"),
        educational: byCatAvg(milestones, "Educational"),
        social: byCatAvg(milestones, "Social"),
        emotional: byCatAvg(milestones, "Emotional"),
        };
    }, [milestones]);

    const activeMilestones = useMemo(() => milestones.filter((m) => m.status !== "Completed"), [milestones]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/70 p-3 md:p-4">
        <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="px-6 py-5 flex items-start justify-between">
            <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Development Tracking
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{child?.fullName || ""}</p>
            </div>

            <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors"
                type="button"
                aria-label="Close"
            >
                <X size={18} />
            </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Body */}
            <div className="px-6 py-6 overflow-y-auto space-y-6">
            {/* Overall */}
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">{stats.overall}%</p>
                </div>

                <div className="mt-3">
                <ProgressBar value={stats.overall} />
                </div>

                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <span className="text-gray-700 dark:text-gray-300">{stats.total} milestones total</span>
                <span className="text-green-700 dark:text-green-200">{stats.completed} completed</span>
                <span className="text-blue-700 dark:text-blue-200">{stats.inProgress} in progress</span>
                </div>
            </div>

            {/* Areas */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Development Areas</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: "Physical Development", value: stats.physical },
                    { label: "Educational Development", value: stats.educational },
                    { label: "Social Development", value: stats.social },
                    { label: "Emotional Development", value: stats.emotional },
                ].map((x) => (
                    <div key={x.label}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{x.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{x.value}%</p>
                    </div>
                    <ProgressBar value={x.value} />
                    </div>
                ))}
                </div>
            </div>

            {/* Active Milestones */}
            <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Milestones</p>

                {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Loading milestones…</div>}

                {!loading && activeMilestones.length === 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    No active milestones yet for this child.
                </div>
                )}

                {activeMilestones.map((m) => (
                <div
                    key={m.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-colors duration-300"
                >
                    <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">{m.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        {m.category} • Due: {m.targetDate ? formatDate(m.targetDate) : "—"}
                        </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full ${statusPill(m.status)}`}>
                        {m.status}
                    </span>
                    </div>

                    <div className="mt-4">
                    <ProgressBar value={m.progress} />
                    </div>

                    {m.notes && <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{m.notes}</p>}
                </div>
                ))}

                <p className="text-sm italic text-gray-500 dark:text-gray-400">
                For detailed milestone tracking and updates, visit the Development Tracking module.
                </p>
            </div>
            </div>
        </div>
        </div>
    );
    }
