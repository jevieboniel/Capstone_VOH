    import React, { useMemo, useState, useEffect } from "react";
    import {
    Plus,
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
    Save,
    X,
    ChevronDown,
    ChevronRight,
    FileText,
    } from "lucide-react";

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
    ✅ NORMALIZERS (MAKE STATS MATCH ACROSS FILES)
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

    /* ------------------------ UI Pieces -------------------------- */
    function ProgressBar({ value, height = "h-2" }) {
    const v = clamp(Number(value || 0));
    return (
        <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${height}`}>
        <div className="h-full bg-gray-900" style={{ width: `${v}%` }} />
        </div>
    );
    }

    function Badge({ className = "", children }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}>
        {children}
        </span>
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
        const res = await fetch(CHILDREN_API, {
        headers: { Authorization: `Bearer ${token}` },
        });
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
        const res = await fetch(MILESTONES_API, {
        headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch milestones");

        const list = Array.isArray(data) ? data : data.milestones || [];
        // ✅ normalize milestones so stats match modal
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

    // Create milestone -> save to DB -> refresh
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

    // Update milestone -> save to DB -> refresh
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
        <div className="min-h-screen bg-gray-50 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Development Tracking</h1>
            </div>

            <button
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700"
                type="button"
            >
                <Plus className="h-4 w-4" />
                Add Milestone
            </button>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Total Children</p>
                    <p className="text-3xl font-bold text-gray-900">{totals.totalChildren}</p>
                    <p className="text-sm text-blue-600">With active milestones</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                    <User className="h-6 w-6 text-blue-600" />
                </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Total Milestones</p>
                    <p className="text-3xl font-bold text-gray-900">{totals.totalMilestones}</p>
                    <p className="text-sm text-gray-600">Being tracked</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                    <Target className="h-6 w-6 text-purple-600" />
                </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{totals.completed}</p>
                    <p className="text-sm text-green-600">Achievements</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">At Risk</p>
                    <p className="text-3xl font-bold text-gray-900">{totals.atRisk}</p>
                    <p className="text-sm text-red-600">Need attention</p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                </div>
            </div>
            </div>

            {/* Empty */}
            {milestones.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
                <p className="text-lg font-semibold text-gray-900">No milestones added yet</p>
                <p className="mt-1 text-sm text-gray-600">
                Click <span className="font-semibold">“Add Milestone”</span> to create a development goal for a child.
                </p>
            </div>
            )}

            {/* Children List */}
            <div className="space-y-4">
            {childrenWithMilestones.map((child) => {
                const childMilestones = milestones.filter((m) => Number(m.childId) === Number(child.id));
                const stats = calculateChildStats(child.id, milestones);
                const isExpanded = expandedChildren.has(child.id);

                return (
                <div key={child.id} className="overflow-hidden rounded-xl border bg-white">
                    {/* Child Header */}
                    <div
                    className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                    onClick={() => toggleChildExpansion(child.id)}
                    >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-gray-100" type="button">
                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>

                        {/* Avatar */}
                        {child.photo ? (
                            <img src={child.photo} alt={child.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                            {initials(child.name)}
                            </div>
                        )}

                        <div>
                            <h3 className="font-medium text-gray-900">{child.name}</h3>
                            <p className="text-sm text-gray-600">
                            Age {child.age} • {childMilestones.length} milestone{childMilestones.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        </div>

                        <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Overall Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.overall}%</p>
                        </div>

                        <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-800">{stats.completedMilestones} Completed</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{stats.inProgressMilestones} In Progress</Badge>
                            {stats.atRiskMilestones > 0 && (
                            <Badge className="bg-red-100 text-red-800">{stats.atRiskMilestones} At Risk</Badge>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                        {/* Development Areas */}
                        <div className="mb-6">
                        <h4 className="mb-4 font-medium text-gray-900">Development Areas</h4>

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
                                <div key={area.name} className="rounded-lg border bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className={`rounded ${meta.chipBg} p-1.5`}>
                                    <Icon className={`h-4 w-4 ${meta.chipIcon}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{meta.label}</span>
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
                        <h4 className="mb-4 font-medium text-gray-900">Active Milestones</h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {childMilestones.map((m) => {
                            const meta = getCategoryMeta(m.category);
                            const Icon = meta.icon;

                            return (
                                <div key={m.id} className="rounded-lg border bg-white p-4">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                    <Icon className={`mt-0.5 h-4 w-4 ${meta.chipIcon}`} />
                                    <div>
                                        <h5 className="font-medium text-gray-900">{m.milestone}</h5>
                                        <p className="mt-1 text-xs text-gray-600">{m.category}</p>
                                    </div>
                                    </div>

                                    <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
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
                                        <span className="text-sm font-medium">{clamp(m.progress)}%</span>
                                    </div>
                                    <ProgressBar value={m.progress} height="h-2" />
                                    </div>

                                    {m.targetDate && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Calendar className="h-3 w-3" />
                                        <span>Due: {formatDate(m.targetDate)}</span>
                                    </div>
                                    )}

                                    {m.notes && <p className="rounded bg-gray-50 p-2 text-xs text-gray-700">{m.notes}</p>}

                                    <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => openDetails(m)}
                                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                        type="button"
                                    >
                                        <Eye className="h-3 w-3" />
                                        Details
                                    </button>

                                    <button
                                        onClick={() => openUpdate(m)}
                                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                        type="button"
                                    >
                                        <Edit className="h-3 w-3" />
                                        Update
                                    </button>
                                    </div>
                                </div>
                                </div>
                            );
                            })}

                            {childMilestones.length === 0 && (
                            <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">
                                No milestones for this child yet.
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                );
            })}
            </div>

            {/* Add Milestone Modal */}
            {openModal && <AddMilestoneModal onClose={handleCloseModal} onSave={handleSaveMilestone} children={children} />}

            {/* Details Modal */}
            {selectedMilestone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-base font-semibold text-gray-900">Milestone Details</h2>
                    </div>
                    <button onClick={closeDetails} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" type="button">
                    <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-gray-100 text-base font-semibold text-gray-700">
                        {initials(selectedMilestone.child)}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{selectedMilestone.child}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        {(() => {
                            const meta = getCategoryMeta(selectedMilestone.category);
                            const Icon = meta.icon;
                            return (
                            <>
                                <Icon className={`h-4 w-4 ${meta.chipIcon}`} />
                                <span>{selectedMilestone.category}</span>
                            </>
                            );
                        })()}
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        selectedMilestone.status
                        )}`}
                    >
                        {getStatusIcon(selectedMilestone.status)}
                        <span>{selectedMilestone.status}</span>
                    </span>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div>
                    <h4 className="mb-2 font-medium text-gray-900">{selectedMilestone.milestone}</h4>
                    <p className="text-sm text-gray-700">{selectedMilestone.description || "—"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Assigned By</p>
                        <p className="text-sm text-gray-900">{selectedMilestone.assignedBy || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Target Date</p>
                        <p className="text-sm text-gray-900">
                        {selectedMilestone.targetDate ? formatDate(selectedMilestone.targetDate) : "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Created Date</p>
                        <p className="text-sm text-gray-900">
                        {selectedMilestone.createdDate ? formatDate(selectedMilestone.createdDate) : "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Last Updated</p>
                        <p className="text-sm text-gray-900">
                        {selectedMilestone.lastUpdated ? formatDate(selectedMilestone.lastUpdated) : "—"}
                        </p>
                    </div>
                    </div>

                    <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">Progress</p>
                        <p className="text-lg font-bold text-gray-900">{clamp(selectedMilestone.progress)}%</p>
                    </div>
                    <ProgressBar value={selectedMilestone.progress} height="h-3" />
                    </div>

                    {selectedMilestone.objectives?.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-600">Objectives</p>
                        <ul className="space-y-1">
                        {selectedMilestone.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-600">•</span>
                            <span>{obj}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}

                    {selectedMilestone.notes && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-600">Current Notes</p>
                        <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">{selectedMilestone.notes}</div>
                    </div>
                    )}
                </div>
                </div>
            </div>
            )}

            {/* Update Modal */}
            {editingMilestone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        <h2 className="text-base font-semibold text-gray-900">Update Milestone</h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">Update progress, status, and notes for this milestone.</p>
                    </div>
                    <button onClick={closeUpdate} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" type="button">
                        <X className="h-4 w-4" />
                    </button>
                    </div>
                </div>

                <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
                    <div>
                    <p className="text-sm font-medium text-gray-600">Child</p>
                    <p className="text-sm text-gray-900">{editingMilestone.child}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingMilestone.category}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, category: e.target.value }))}
                        >
                        <option value="Physical">Physical</option>
                        <option value="Educational">Educational</option>
                        <option value="Social">Social</option>
                        <option value="Emotional">Emotional</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingMilestone.status}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, status: e.target.value }))}
                        >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Completed">Completed</option>
                        </select>
                    </div>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Milestone Title</label>
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingMilestone.milestone}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, milestone: e.target.value }))}
                        placeholder="Milestone title"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={editingMilestone.description || ""}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, description: e.target.value }))}
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Progress: {clamp(editingMilestone.progress)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={clamp(editingMilestone.progress)}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, progress: parseInt(e.target.value, 10) || 0 }))}
                        className="w-full"
                    />
                    <ProgressBar value={editingMilestone.progress} height="h-2" />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Target Date</label>
                    <input
                        type="date"
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingMilestone.targetDate || ""}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, targetDate: e.target.value }))}
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Objectives</label>
                    {(editingMilestone.objectives || []).map((obj, idx) => (
                        <div key={idx} className="flex gap-2">
                        <input
                            className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={obj}
                            onChange={(e) => updateEditingObjective(idx, e.target.value)}
                            placeholder={`Objective ${idx + 1}`}
                        />
                        {(editingMilestone.objectives || []).length > 1 && (
                            <button onClick={() => removeEditingObjective(idx)} className="rounded-md border px-3 hover:bg-gray-50" type="button">
                            <X className="h-4 w-4" />
                            </button>
                        )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addEditingObjective}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4" />
                        Add Objective
                    </button>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={editingMilestone.notes || ""}
                        onChange={(e) => setEditingMilestone((p) => ({ ...p, notes: e.target.value }))}
                    />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <button onClick={closeUpdate} className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" type="button">
                    Cancel
                    </button>
                    <button
                    onClick={saveUpdate}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    type="button"
                    >
                    <Save className="h-4 w-4" />
                    Save Changes
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
    };

    export default Development;

    /* ==========================================================
    AddMilestoneModal (DB Children dropdown)
    ========================================================== */
    const AddMilestoneModal = ({ onClose, onSave, children = [] }) => {
    const [childId, setChildId] = useState("");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [notes, setNotes] = useState("");
    const [objectives, setObjectives] = useState([""]);

    const addObjective = () => setObjectives([...objectives, ""]);

    const updateObjective = (value, index) => {
        const list = [...objectives];
        list[index] = value;
        setObjectives(list);
    };

    const submitForm = () => {
        if (!childId || !category || !title || !targetDate) {
        alert("Please fill required fields");
        return;
        }

        onSave({
        childId: Number(childId),
        category,
        title,
        description,
        targetDate,
        objectives,
        notes,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">🎯 Add New Milestone</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700" type="button">
                ✕
            </button>
            </div>

            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="text-sm font-medium">Child *</label>
                <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="w-full bg-slate-100 p-2 rounded-lg text-sm"
                >
                <option value="">Select child</option>
                {children.map((c) => (
                    <option key={c.id} value={c.id}>
                    {c.fullName || c.name}
                    </option>
                ))}
                </select>
            </div>

            <div>
                <label className="text-sm font-medium">Category *</label>
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-100 p-2 rounded-lg text-sm"
                >
                <option value="">Select category</option>
                <option value="Physical">Physical</option>
                <option value="Educational">Educational</option>
                <option value="Social">Social</option>
                <option value="Emotional">Emotional</option>
                </select>
            </div>
            </div>

            <label className="text-sm font-medium">Milestone Title *</label>
            <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reading Level 3"
            className="w-full bg-slate-100 p-2 rounded-lg mb-4"
            />

            <label className="text-sm font-medium">Description</label>
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe milestone..."
            className="w-full bg-slate-100 p-2 rounded-lg h-24 mb-4"
            />

            <label className="text-sm font-medium">Target Date *</label>
            <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-slate-100 p-2 rounded-lg mb-4"
            />

            <label className="text-sm font-medium">Objectives</label>
            {objectives.map((obj, i) => (
            <input
                key={i}
                value={obj}
                onChange={(e) => updateObjective(e.target.value, i)}
                placeholder={`Objective ${i + 1}`}
                className="w-full bg-slate-100 p-2 rounded-lg mb-2"
            />
            ))}
            <button onClick={addObjective} className="border rounded-lg px-3 py-1 text-sm" type="button">
            + Add Objective
            </button>

            <label className="text-sm font-medium mt-4 block">Initial Notes</label>
            <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full bg-slate-100 p-2 rounded-lg h-20 mb-6"
            />

            <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg" type="button">
                Cancel
            </button>
            <button
                onClick={submitForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                type="button"
            >
                💾 Create Milestone
            </button>
            </div>
        </div>
        </div>
    );
    };
