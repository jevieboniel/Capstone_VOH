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
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo / Brand */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white flex items-center justify-center ring-1 ring-gray-100">
            <img src="/voh.png" alt="Village of Hope Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              Village of Hope
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Child tracking & development Monitoring
            </p>
          </div>
        </div>

        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation label */}
      <p className="px-6 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
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
                className={`mx-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-blue-50 text-gray-900 border border-blue-100 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                    active ? "bg-white border-blue-100" : "bg-white border-gray-200"
                  }`}
                >
                  <SvgIcon
                    iconPath={ICON_MAP[item.icon]}
                    className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`}
                  />
                </span>
                <span className="truncate">{item.name}</span>

                {/* right active indicator */}
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
              </Link>
            );
          }

          if (item.isCategory) {
            const isOpen = expandedCategories.includes(item.category);

            return (
              <div key={item.category} className="mt-1">
                <button
                  onClick={() => toggleCategory(item.category)}
                  className="w-full px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-gray-500 tracking-wide uppercase hover:text-gray-700 transition"
                  type="button"
                >
                  <span>{item.category}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                            className={`mx-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all
                              ${
                                active
                                  ? "bg-blue-50 text-gray-900 border border-blue-100 shadow-sm"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                          >
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                                active ? "bg-white border-blue-100" : "bg-white border-gray-200"
                              }`}
                            >
                              <SvgIcon
                                iconPath={ICON_MAP[navItem.icon]}
                                className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`}
                              />
                            </span>
                            <span className="truncate">{navItem.name}</span>

                            {active && <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
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
