import React, { useMemo, useState, useEffect } from "react";
import {
    Target,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Smile,
    Book,
    Users,
    Heart,
    Eye,
    Edit,
    User,
    ChevronDown,
    ChevronRight,
    } from "lucide-react";
    import Button from "../UI/Button";
    import Milestonemodal from "../Modals/MilestoneModal";
    import { UI } from "../UI/uiTokens";
    import UpdateMilestoneModal from "../Modals/UpdateMilestoneModal";
    import MilestoneDetailsModal from "../Modals/MilestoneDetailsModal";

    /* ----------------- Helpers (status + colors) ----------------- */
    const getStatusColor = (status) => {
    switch (status) {
        case "Completed":
        return "bg-green-100 text-green-800";
        case "In Progress":
        return "bg-blue-100 text-blue-800";
        case "At Risk":
        return "bg-red-100 text-red-800";
        case "Planned":
        default:
        return "bg-gray-100 text-gray-800";
    }
    };

    const getStatusIcon = (status) => {
    switch (status) {
        case "Completed":
        return <CheckCircle className="h-4 w-4" />;
        case "In Progress":
        return <Clock className="h-4 w-4" />;
        case "At Risk":
        return <AlertCircle className="h-4 w-4" />;
        default:
        return <Target className="h-4 w-4" />;
    }
    };

    const getCategoryMeta = (category) => {
    switch (category) {
        case "Physical":
        return { label: "Physical", icon: Heart, chipBg: "bg-red-100", chipIcon: "text-red-600" };
        case "Educational":
        return { label: "Educational", icon: Book, chipBg: "bg-blue-100", chipIcon: "text-blue-600" };
        case "Social":
        return { label: "Social", icon: Users, chipBg: "bg-green-100", chipIcon: "text-green-600" };
        case "Emotional":
        return { label: "Emotional", icon: Smile, chipBg: "bg-purple-100", chipIcon: "text-purple-600" };
        default:
        return { label: category || "Other", icon: Target, chipBg: "bg-gray-100", chipIcon: "text-gray-600" };
    }
    };

    const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Number(n || 0)));

    const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
    };

    const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2);

    /* ===========================
    NORMALIZERS (MAKE STATS MATCH ACROSS FILES)
    =========================== */
    const normalizeCategory = (c) => {
    const v = String(c || "").trim().toLowerCase();

    if (v === "physical") return "Physical";
    if (v === "educational" || v === "education" || v === "academic") return "Educational";
    if (v === "social") return "Social";
    if (v === "emotional" || v === "emotion") return "Emotional";

    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "Other";
    };

    const normalizeMilestone = (m) => ({
    ...m,
    id: m.id ?? m._id,
    childId: Number(m.childId ?? m.child_id ?? m.childID ?? m.child),
    category: normalizeCategory(m.category),
    title: m.title ?? m.milestone ?? "",
    milestone: m.milestone ?? m.title ?? "",
    description: m.description ?? "",
    progress: clamp(Number(m.progress ?? 0)),
    status: String(m.status ?? "Planned").trim(),
    targetDate: m.targetDate ?? m.target_date ?? null,
    notes: m.notes ?? "",
    objectives: Array.isArray(m.objectives) ? m.objectives : [],
    });

    /* ------------------------ Stats Helpers -------------------------- */
    const calculateChildStats = (childId, milestones) => {
    const childMilestones = milestones.filter((m) => Number(m.childId) === Number(childId));
    if (childMilestones.length === 0) {
        return {
        overall: 0,
        completedMilestones: 0,
        inProgressMilestones: 0,
        atRiskMilestones: 0,
        physical: 0,
        educational: 0,
        social: 0,
        emotional: 0,
        };
    }

    const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, x) => s + clamp(x.progress), 0) / arr.length) : 0);
    const byCat = (cat) => childMilestones.filter((m) => m.category === cat);

    const overall = Math.round(childMilestones.reduce((s, m) => s + clamp(m.progress), 0) / childMilestones.length);

    return {
        overall: clamp(overall),
        completedMilestones: childMilestones.filter((m) => m.status === "Completed").length,
        inProgressMilestones: childMilestones.filter((m) => m.status === "In Progress").length,
        atRiskMilestones: childMilestones.filter((m) => m.status === "At Risk").length,
        physical: avg(byCat("Physical")),
        educational: avg(byCat("Educational")),
        social: avg(byCat("Social")),
        emotional: avg(byCat("Emotional")),
    };
    };
    /* ------------------------ UI Components -------------------------- */
    const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}>{children}</div>
    );

    const CardContent = ({ children, className = "" }) => <div className={`px-5 py-5 ${className}`}>{children}</div>;

    const Badge = ({ className = "", children }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
        {children}
    </span>
    );

    function ProgressBar({ value, height = "h-2" }) {
    const v = clamp(Number(value || 0));
    return (
        <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${height}`}>
        <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 transition-all shadow-sm"
            style={{ width: `${v}%` }}
        />
        </div>
    );
    }

    /* ------------------------ Component -------------------------- */
    const Development = () => {
    const [openModal, setOpenModal] = useState(false);

    const [children, setChildren] = useState([]);
    const [milestones, setMilestones] = useState([]);

    const [expandedChildren, setExpandedChildren] = useState(new Set());
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [editingMilestone, setEditingMilestone] = useState(null);

    const token = localStorage.getItem("admin_token");

    const CHILDREN_API = "http://localhost:5000/api/children";
    const MILESTONES_API = "http://localhost:5000/api/milestones";

    const fetchChildren = async () => {
        const res = await fetch(CHILDREN_API, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch children");

        const list = Array.isArray(data) ? data : data.children || [];
        const normalized = list.map((c) => {
        const first = c.firstName ?? c.first_name ?? "";
        const middle = c.middleName ?? c.middle_name ?? "";
        const last = c.lastName ?? c.last_name ?? "";
        const fullName = `${first} ${middle ? middle + " " : ""}${last}`.trim();

        return {
            ...c,
            fullName,
            name: fullName,
            photo: c.photoUrl || c.photo_url || c.photo || null,
        };
        });

        setChildren(normalized);
    };

    const fetchMilestones = async () => {
        const res = await fetch(MILESTONES_API, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch milestones");

        const list = Array.isArray(data) ? data : data.milestones || [];
        setMilestones(list.map(normalizeMilestone));
    };

    useEffect(() => {
        (async () => {
        try {
            await fetchChildren();
            await fetchMilestones();
        } catch (e) {
            console.error(e);
        }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddMilestone = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleSaveMilestone = async (data) => {
        try {
        const payload = {
            childId: Number(data.childId),
            category: normalizeCategory(data.category),
            title: data.title,
            description: data.description || "",
            targetDate: data.targetDate || null,
            notes: data.notes || "",
            objectives: Array.isArray(data.objectives) ? data.objectives : [],
        };

        const res = await fetch(MILESTONES_API, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error("Create milestone failed:", json);
            alert(json?.error || "Failed to create milestone");
            return;
        }

        await fetchMilestones();
        setOpenModal(false);
        } catch (err) {
        console.error(err);
        alert("Failed to create milestone");
        }
    };

    const saveUpdate = async () => {
        if (!editingMilestone?.milestone || !editingMilestone?.category) return;

        try {
        const payload = {
            ...editingMilestone,
            category: normalizeCategory(editingMilestone.category),
            progress: clamp(editingMilestone.progress),
        };

        const res = await fetch(`${MILESTONES_API}/${editingMilestone.id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error("Update milestone failed:", json);
            alert(json?.error || "Failed to update milestone");
            return;
        }

        await fetchMilestones();
        setEditingMilestone(null);
        } catch (err) {
        console.error(err);
        alert("Failed to update milestone");
        }
    };

    const childrenWithMilestones = useMemo(() => {
        const childIds = new Set(milestones.map((m) => Number(m.childId)).filter(Boolean));
        return children.filter((c) => childIds.has(Number(c.id)));
    }, [milestones, children]);

    const totals = useMemo(() => {
        const totalChildren = childrenWithMilestones.length;
        const totalMilestones = milestones.length;
        const completed = milestones.filter((m) => m.status === "Completed").length;
        const atRisk = milestones.filter((m) => m.status === "At Risk").length;
        return { totalChildren, totalMilestones, completed, atRisk };
    }, [milestones, childrenWithMilestones]);

    const toggleChildExpansion = (childId) => {
        setExpandedChildren((prev) => {
        const next = new Set(prev);
        if (next.has(childId)) next.delete(childId);
        else next.add(childId);
        return next;
        });
    };

    const openDetails = (milestone) => setSelectedMilestone(milestone);
    const openUpdate = (milestone) => setEditingMilestone({ ...milestone });

    const closeDetails = () => setSelectedMilestone(null);
    const closeUpdate = () => setEditingMilestone(null);

    const updateEditingObjective = (index, value) => {
        setEditingMilestone((prev) => ({
        ...prev,
        objectives: (prev.objectives || []).map((o, i) => (i === index ? value : o)),
        }));
    };

    const addEditingObjective = () => {
        setEditingMilestone((prev) => ({
        ...prev,
        objectives: [...(prev.objectives || []), ""],
        }));
    };

    const removeEditingObjective = (index) => {
        setEditingMilestone((prev) => ({
        ...prev,
        objectives: (prev.objectives || []).filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Development Tracking</h1>
            <p className="mt-1 text-sm text-gray-600">Track milestones and monitor each child’s progress</p>
            </div>

            <Button onClick={handleAddMilestone} variant="primary" type="button" className="px-6 py-2.5">
            Add Milestone
            </Button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Total Children
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totals.totalChildren}</p>
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">With active milestones</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Total Milestones
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totals.totalMilestones}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Being tracked</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Completed</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totals.completed}</p>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Achievements</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-red-500">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">At Risk</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{totals.atRisk}</p>
                    <p className="text-xs sm:text-sm text-red-600 font-medium">Need attention</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                    <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Empty */}
        {milestones.length === 0 && (
            <Card className="border-dashed">
            <CardContent className="px-6 py-10 text-center">
                <p className="text-lg font-semibold text-gray-900">No milestones added yet</p>
                <p className="mt-1 text-sm text-gray-600">
                Click <span className="font-semibold">“Add Milestone”</span> to create a development goal for a child.
                </p>
            </CardContent>
            </Card>
        )}

        {/* Children List */}
        <div className="space-y-4">
            {childrenWithMilestones.map((child) => {
            const childMilestones = milestones.filter((m) => Number(m.childId) === Number(child.id));
            const stats = calculateChildStats(child.id, milestones);
            const isExpanded = expandedChildren.has(child.id);

            return (
                <Card key={child.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Child Header */}
                <div
                    className="cursor-pointer px-5 py-4 transition-colors hover:bg-gray-50"
                    onClick={() => toggleChildExpansion(child.id)}
                >
                    <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                        className="shrink-0 rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50"
                        type="button"
                        >
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>

                        {child.photo ? (
                        <img src={child.photo} alt={child.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                            {initials(child.name)}
                        </div>
                        )}

                        <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{child.name}</h3>
                        <p className="text-sm text-gray-600 truncate">
                            Age {child.age} • {childMilestones.length} milestone{childMilestones.length !== 1 ? "s" : ""}
                        </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                        <p className="text-sm text-gray-600">Overall Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overall}%</p>
                        </div>

                        <div className="hidden lg:flex gap-2">
                        <Badge className="bg-green-100 text-green-800">{stats.completedMilestones} Completed</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{stats.inProgressMilestones} In Progress</Badge>
                        {stats.atRiskMilestones > 0 && (
                            <Badge className="bg-red-100 text-red-800">{stats.atRiskMilestones} At Risk</Badge>
                        )}
                        </div>
                    </div>
                    </div>

                    {/* badges for smaller screens */}
                    <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                    <Badge className="bg-green-100 text-green-800">{stats.completedMilestones} Completed</Badge>
                    <Badge className="bg-blue-100 text-blue-800">{stats.inProgressMilestones} In Progress</Badge>
                    {stats.atRiskMilestones > 0 && <Badge className="bg-red-100 text-red-800">{stats.atRiskMilestones} At Risk</Badge>}
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="border-t bg-gradient-to-br from-gray-50 via-white to-gray-50 px-5 py-5">
                    {/* Development Areas */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Development Areas</h4>
                        <span className="text-xs text-gray-500">Average progress per category</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { name: "Physical", value: stats.physical },
                            { name: "Educational", value: stats.educational },
                            { name: "Social", value: stats.social },
                            { name: "Emotional", value: stats.emotional },
                        ].map((area) => {
                            const meta = getCategoryMeta(area.name);
                            const Icon = meta.icon;

                            return (
                            <div key={area.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2">
                                <div className={`rounded-xl ${meta.chipBg} p-2`}>
                                    <Icon className={`h-4 w-4 ${meta.chipIcon}`} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{meta.label}</span>
                                </div>

                                <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Progress</span>
                                    <span className="text-sm font-bold text-gray-900">{area.value}%</span>
                                </div>
                                <ProgressBar value={area.value} height="h-2" />
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>

                    {/* Active Milestones */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Active Milestones</h4>
                        <span className="text-xs text-gray-500">{childMilestones.length} total</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {childMilestones.map((m) => {
                            const meta = getCategoryMeta(m.category);
                            const Icon = meta.icon;

                            return (
                            <div key={m.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 min-w-0">
                                    <div className={`mt-0.5 rounded-xl ${meta.chipBg} p-2`}>
                                    <Icon className={`h-4 w-4 ${meta.chipIcon}`} />
                                    </div>
                                    <div className="min-w-0">
                                    <h5 className="font-semibold text-gray-900 truncate">{m.milestone}</h5>
                                    <p className="mt-1 text-xs text-gray-600">{m.category}</p>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                    m.status
                                    )}`}
                                >
                                    {getStatusIcon(m.status)}
                                    <span>{m.status}</span>
                                </span>
                                </div>

                                <div className="space-y-2">
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Progress</span>
                                    <span className="text-sm font-semibold">{clamp(m.progress)}%</span>
                                    </div>
                                    <ProgressBar value={m.progress} height="h-2" />
                                </div>

                                {m.targetDate && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {formatDate(m.targetDate)}</span>
                                    </div>
                                )}

                                {m.notes && (
                                    <p className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700">
                                    {m.notes}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => openDetails(m)} className={UI.btnSmallOutline} type="button">
                                    <Eye className="h-3 w-3" />
                                    Details
                                    </button>

                                    <button onClick={() => openUpdate(m)} className={UI.btnSmallOutline} type="button">
                                    <Edit className="h-3 w-3" />
                                    Update
                                    </button>
                                </div>
                                </div>
                            </div>
                            );
                        })}

                        {childMilestones.length === 0 && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
                            No milestones for this child yet.
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                )}
                </Card>
            );
            })}
        </div>

        {/* Add Milestone Modal */}
        {openModal && (
            <Milestonemodal onClose={handleCloseModal} onSave={handleSaveMilestone} children={children} />
        )}

        {/* Details Modal */}
        {selectedMilestone && (
            <MilestoneDetailsModal
            UI={UI}
            selectedMilestone={selectedMilestone}
            closeDetails={closeDetails}
            initials={initials}
            getCategoryMeta={getCategoryMeta}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            clamp={clamp}
            ProgressBar={ProgressBar}
            />
        )}

        {/* Update Modal */}
        <UpdateMilestoneModal
            UI={UI}
            editingMilestone={editingMilestone}
            setEditingMilestone={setEditingMilestone}
            closeUpdate={closeUpdate}
            saveUpdate={saveUpdate}
            clamp={clamp}
            ProgressBar={ProgressBar}
            updateEditingObjective={updateEditingObjective}
            addEditingObjective={addEditingObjective}
            removeEditingObjective={removeEditingObjective}
        />
        </div>
    );
};

export default Development;
