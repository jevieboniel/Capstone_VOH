import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, UserPlus, MapPin, User, Calendar, Heart, FileText } from "lucide-react";
import Button from "../UI/Button";
import {
  AddChildModal,
  EditProfileModal,
  ChildDetailModal,
  ReintegrationModal,
  getStatusColor,
  getHealthStatusColor,
  getAdoptionStatusColor,
} from "../Modals/ChildrenModals";

// ✅ NEW: this is the modal that shows the Development Tracking summary (like your screenshot)
import DevelopmentSummaryModal from "../Modals/DevelopmentSummaryModal";

const Children = () => {
  const CHILDREN_ROUTE = "/children";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedChild, setSelectedChild] = useState(null);
  const [editChild, setEditChild] = useState(null);
  const [reintegrationChild, setReintegrationChild] = useState(null);

  // ✅ NEW: child that is currently being viewed in Development modal
  const [devChild, setDevChild] = useState(null);

  const API_URL = "http://localhost:5000/api/children";
  const token = localStorage.getItem("admin_token");

  // Fetch children on load
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return console.error("Fetch children failed:", data);

        const list = Array.isArray(data) ? data : data.children || [];
        const normalized = list.map((c) => ({
          ...c,
          image: c.image || "https://i.pravatar.cc/100",
          photoUrl: c.photoUrl || c.photo_url || c.photo || null,
        }));

        setChildren(normalized);
      } catch (err) {
        console.error("Fetch children error:", err);
      }
    };

    fetchChildren();
  }, [API_URL, token]);

  // Auto-open Add Child modal via /children?add=1
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setShowModal(true);
      navigate(CHILDREN_ROUTE, { replace: true });
    }
  }, [searchParams, navigate]);

  // Add child
  const handleAddChild = async (child) => {
    try {
      const formData = new FormData();
      Object.entries(child).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "photo") return;
        formData.append(key, value);
      });
      if (child.photo) formData.append("photo", child.photo);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return console.error("Add child failed:", data);

      const created = data.child || data;
      const normalized = {
        ...created,
        image: created.image || "https://i.pravatar.cc/100",
        photoUrl: created.photoUrl || created.photo_url || created.photo || null,
      };

      setChildren((prev) => [...prev, normalized]);
      setShowModal(false);
    } catch (err) {
      console.error("Add child error:", err);
    }
  };

  // Update child
  const updateChild = async (updatedChild) => {
    try {
      const id = updatedChild.id;
      const formData = new FormData();

      Object.entries(updatedChild).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "photo") return; // handled below
        formData.append(key, value);
      });

      if (updatedChild.photo) formData.append("photo", updatedChild.photo);

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return console.error("Update child failed:", data);

      const saved = data.child || data;
      const normalized = {
        ...saved,
        image: saved.image || "https://i.pravatar.cc/100",
        photoUrl: saved.photoUrl || saved.photo_url || saved.photo || updatedChild.photoUrl || null,
      };

      setChildren((prev) => prev.map((c) => (c.id === normalized.id ? normalized : c)));
      setSelectedChild((prev) => (prev?.id === normalized.id ? normalized : prev));
    } catch (err) {
      console.error("Update child error:", err);
    }
  };

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const fullText = `
        ${child.firstName || child.first_name || ""} ${child.middleName || child.middle_name || ""} ${child.lastName || child.last_name || ""}
        ${child.house || ""} ${child.educationLevel || child.education_level || ""}
      `
        .toLowerCase()
        .trim();

      return fullText.includes(search.toLowerCase());
    });
  }, [children, search]);

  // ✅ NEW helper: normalize name for the Dev modal header
  const withFullName = (c) => {
    if (!c) return null;
    const firstName = c.firstName ?? c.first_name ?? "";
    const middleName = c.middleName ?? c.middle_name ?? "";
    const lastName = c.lastName ?? c.last_name ?? "";
    return {
      ...c,
      fullName: `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim(),
    };
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen space-y-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Children Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage child profiles, status, and reintegration details
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          type="button"
          className="w-full sm:w-[140px] h-[44px] rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-semibold">Add Child</span>
          </div>
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="🔍 Search children by name, house, or education level..."
            className="w-full pl-11 pr-4 h-12 border border-gray-300 dark:border-gray-700 rounded-xl
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredChildren.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-10 text-center shadow-sm transition-colors duration-300">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No children found</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Click “Add Child” to create a record</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => {
          const firstName = child.firstName ?? child.first_name ?? "";
          const middleName = child.middleName ?? child.middle_name ?? "";
          const lastName = child.lastName ?? child.last_name ?? "";
          const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();

          return (
            <div
              key={child.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800
                         hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <img
                    src={child.photoUrl || child.image}
                    alt={fullName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{fullName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {child.age} years old • {child.gender}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                    onClick={() => setSelectedChild(child)}
                    type="button"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                    onClick={() => setEditChild(child)}
                    type="button"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                    onClick={() => setReintegrationChild(child)}
                    type="button"
                    title="Reintegration"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 my-2">
                {child.status && (
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(child.status)}`}>
                    {child.status}
                  </span>
                )}
                {child.healthStatus && (
                  <span className={`text-xs px-3 py-1 rounded-full border ${getHealthStatusColor(child.healthStatus)}`}>
                    {child.healthStatus}
                  </span>
                )}
                {child.adoptionStatus && (
                  <span className={`text-xs px-3 py-1 rounded-full border ${getAdoptionStatusColor(child.adoptionStatus)}`}>
                    {child.adoptionStatus}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 dark:text-gray-500" />{" "}
                  {child.house || "No house assigned"}
                </p>
                <p className="flex items-center gap-2">
                  <User size={14} className="text-gray-400 dark:text-gray-500" />{" "}
                  {child.houseParent || "No house parent"}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>Admitted: {child.admissionDate || "—"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>Education: {child.educationLevel || "—"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Heart size={14} className="text-gray-400 dark:text-gray-500" />
                  <span>Health: {child.healthStatus || "—"}</span>
                </p>
              </div>

              {child.notes && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-200 transition-colors duration-300">
                  {child.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showModal && <AddChildModal onClose={() => setShowModal(false)} onAddChild={handleAddChild} />}

      {selectedChild && (
        <ChildDetailModal
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
          onEdit={(c) => setEditChild(c)}
          // ✅ NEW: when user clicks "View Development" inside ChildDetailModal
          onViewDevelopment={(c) => setDevChild(withFullName(c))}
        />
      )}

      {editChild && <EditProfileModal child={editChild} onClose={() => setEditChild(null)} onSave={updateChild} />}

      {reintegrationChild && (
        <ReintegrationModal
          child={reintegrationChild}
          onClose={() => setReintegrationChild(null)}
          onComplete={updateChild}
        />
      )}

      {/* ✅ NEW: Development summary modal */}
      {devChild && (
        <DevelopmentSummaryModal
          child={devChild}
          token={token}
          onClose={() => setDevChild(null)}
        />
      )}
    </div>
  );
};

export default Children;
