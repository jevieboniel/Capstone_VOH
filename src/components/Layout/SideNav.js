import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNavItems, ICON_MAP } from "../../config/routes";

const SideNav = ({ onClose }) => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState(["Content"]);
  const navItems = getNavItems();

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const SvgIcon = ({ iconPath, className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={iconPath}
      />
    </svg>
  );

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo / Brand */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              Village of Hope
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Orphanage Management
            </p>
          </div>
        </div>

        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation label */}
      <p className="px-6 text-xs font-semibold text-gray-400 tracking-wider uppercase">
        Navigation
      </p>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-4 space-y-2">
        {navItems.map((item) => {
          if (item.isStandalone) {
            const active = isActiveRoute(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`mx-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <SvgIcon
                  iconPath={ICON_MAP[item.icon]}
                  className={`w-5 h-5 ${
                    active ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          }

          if (item.isCategory) {
            const isOpen = expandedCategories.includes(item.category);

            return (
              <div key={item.category} className="mt-1">
                <button
                  onClick={() => toggleCategory(item.category)}
                  className="w-full px-6 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 tracking-wide uppercase"
                >
                  <span>{item.category}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {item.items
                      .filter((navItem) => navItem.showInNav)
                      .map((navItem) => {
                        const active = isActiveRoute(navItem.path);

                        return (
                          <Link
                            key={navItem.path}
                            to={navItem.path}
                            onClick={onClose}
                            className={`mx-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                              ${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                          >
                            <SvgIcon
                              iconPath={ICON_MAP[navItem.icon]}
                              className={`w-5 h-5 ${
                                active ? "text-blue-600" : "text-gray-400"
                              }`}
                            />
                            <span className="truncate">{navItem.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
};

export default SideNav;
