import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAllRoutes } from "../../config/routes";

const TopNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileRef = useRef(null);

  const allRoutes = useMemo(() => getAllRoutes(), []);
  const profileRoute = allRoutes.find(
    (item) => !item.showInNav && item.name === "Profile"
  );

  // Close dropdown on outside click + ESC
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const initial = (user?.name?.trim()?.[0] || "A").toUpperCase();

  return (
    <header className="sticky top-0 z-40">
      {/* Glass + border like modern dashboards */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onMenuClick}
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label="Open menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Brand (mobile) */}
              <div className="lg:hidden min-w-0">
                <p className="text-base font-semibold text-slate-900 leading-tight truncate">
                  Dashboard
                </p>
                <p className="text-xs text-slate-500 -mt-0.5 truncate">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Center: Search (desktop) */}
            <div className="hidden lg:block flex-1 max-w-xl">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white
                            text-sm text-slate-900 placeholder:text-slate-400
                            shadow-sm focus:shadow-md transition
                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Notifications */}
              <button
                className="hidden lg:inline-flex relative items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                  />
                </svg>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-slate-50 transition
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {initial}
                    </span>
                  </div>

                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-semibold text-slate-900 max-w-[160px] truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-[160px] truncate">
                      {user?.email || "Administrator"}
                    </p>
                  </div>

                  <svg
                    className={`hidden lg:block w-4 h-4 text-slate-400 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden z-50"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.name || "Admin"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email || "Administrator"}
                      </p>
                    </div>

                    <div className="py-2">
                      {profileRoute && (
                        <Link
                          to={profileRoute.path}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          onClick={() => setIsProfileOpen(false)}
                          role="menuitem"
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20a6 6 0 1112 0H6z"
                            />
                          </svg>
                          Profile Settings
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search bar (toggle) */}
          {mobileSearchOpen && (
            <div className="lg:hidden mt-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white
                            text-sm text-slate-900 placeholder:text-slate-400
                            shadow-sm focus:shadow-md transition
                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
