import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAllRoutes } from "../../config/routes";
import { useNotifications } from "../../contexts/NotificationsContext";

const TopNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const { unread, items, markAllRead, clearAll } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ✅ Dark Mode (GLOBAL toggle)
  const [darkMode, setDarkMode] = useState(() => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    if (hasDarkClass) return true;
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ Apply theme instantly
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const allRoutes = useMemo(() => getAllRoutes(), []);
  const profileRoute = allRoutes.find(
    (item) => !item.showInNav && item.name === "Profile"
  );

  // Close dropdown on outside click + ESC
  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setNotifOpen(false);
      }
    };

    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
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
      <div className="bg-white/80 dark:bg-gray-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800 transition-colors duration-300">
        <div className="px-2 lg:px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onMenuClick}
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 dark:border-gray-800
                           bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800
                           text-slate-700 dark:text-gray-200 transition
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label="Open menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                <p className="text-base font-semibold text-slate-900 dark:text-gray-100 truncate">
                  Dashboard
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 -mt-0.5 truncate">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="inline-flex relative items-center justify-center h-10 w-10 rounded-xl border border-slate-200 dark:border-gray-800
                          bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800
                          text-slate-700 dark:text-gray-200 transition
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                    />
                  </svg>

                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold grid place-items-center ring-2 ring-white dark:ring-gray-900">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                        Notifications
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={markAllRead}
                          className="text-xs px-2 py-1 rounded-lg text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={clearAll}
                          className="text-xs px-2 py-1 rounded-lg text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[360px] overflow-auto">
                      {items.length === 0 ? (
                        <p className="p-4 text-sm text-slate-600 dark:text-gray-300">
                          No notifications yet.
                        </p>
                      ) : (
                        items.slice(0, 20).map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b border-slate-100 dark:border-gray-800"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                              {n.type} • {new Date(n.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm mt-2 whitespace-pre-line text-slate-800 dark:text-gray-200">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {initial}
                    </span>
                  </div>

                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-gray-100">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs truncate text-slate-500 dark:text-gray-400">
                      {user?.email || "Administrator"}
                    </p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
                      <p className="text-sm font-semibold truncate text-slate-900 dark:text-gray-100">
                        {user?.name || "Admin"}
                      </p>
                      <p className="text-xs truncate text-slate-500 dark:text-gray-400">
                        {user?.email || "Administrator"}
                      </p>
                    </div>

                    <div className="py-2">
                      {profileRoute && (
                        <Link
                          to={profileRoute.path}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Profile Settings
                        </Link>
                      )}

                      {/* ✅ Dark Mode here */}
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-slate-700 dark:text-gray-200">
                          Dark Mode
                        </span>

                        <button
                          onClick={() => setDarkMode((v) => !v)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            darkMode ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                              darkMode ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="my-1 border-t border-slate-100 dark:border-gray-800" />

                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;