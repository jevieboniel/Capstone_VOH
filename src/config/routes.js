// src/config/routes.js

// -----------------------------------------
// ROUTES
// -----------------------------------------
export const ROUTES = [
  {
    path: "/profile",
    name: "Profile",
    icon: "UserCircleIcon",
    component: "Profile",
    showInNav: false,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "HomeIcon",
    component: "Dashboard",
    showInNav: true,
  },
  {
    path: "/children",
    name: "Children",
    icon: "UsersIcon",
    component: "Children",
    showInNav: true,
  },
  {
    path: "/children/development",
    name: "Development",
    icon: "TrendingUpIcon",
    component: "Development",
    showInNav: true,
  },
  {
    path: "/children/donations",
    name: "Donations",
    icon: "DollarSignIcon",
    component: "Donations",
    showInNav: true,
  },
  {
    path: "/children/reports",
    name: "Reports",
    icon: "DocumentIcon",
    component: "Reports",
    showInNav: true,
  },
  {
    path: "/children/alerts",
    name: "Alerts",
    icon: "AlertTriangleIcon",
    component: "Alerts",
    showInNav: true,
  },
  {
    path: "/users",
    name: "Users",
    icon: "ShieldIcon",
    component: "Users",
    showInNav: true,
  },
  {
    path: "/donate",
    name: "Donate",
    icon: "DollarSignIcon",
    component: "DonateCheckout",
    showInNav: false,
  },
  {
    path: "/donate-success",
    name: "Donate Success",
    icon: "CheckCircleIcon",
    component: "DonateSuccess",
    showInNav: false,
  },
  {
    path: "/setting",
    name: "Setting",
    icon: "Cog6ToothIcon",
    component: "Setting",
    showInNav: true,
  },
];

// -----------------------------------------
// ICON MAP (SVG path "d" attributes)
// -----------------------------------------
export const ICON_MAP = {
  HomeIcon:
    "M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z",

  UsersIcon:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z",

  TrendingUpIcon: "M3 17l6-6 4 4 8-8",

  DollarSignIcon: "M12 2v20M16 8H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8",

  DocumentIcon:
    "M9 3.75h6.75L21 9v11.25A2.25 2.25 0 0 1 18.75 22.5H9A2.25 2.25 0 0 1 6.75 20.25V6A2.25 2.25 0 0 1 9 3.75zM12 11.25h5.25M12 14.25h3.75M12 17.25h2.25",

  AlertTriangleIcon: "M12 9v4m0 4h.01M3 19h18L12 3z",

  ShieldIcon: "M12 3l7 4v6c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z",

  Cog6ToothIcon:
    "M12 3a2 2 0 0 1 2 2v1.2a7 7 0 0 1 2.4.98l.85-.85a2 2 0 1 1 2.8 2.8l-.85.85a7 7 0 0 1 .98 2.4H19a2 2 0 1 1 0 4h-1.2a7 7 0 0 1-.98 2.4l.85.85a2 2 0 1 1-2.8 2.8l-.85-.85a7 7 0 0 1-2.4.98V19a2 2 0 1 1-4 0v-1.2a7 7 0 0 1-2.4-.98l-.85.85a2 2 0 1 1-2.8-2.8l.85-.85a7 7 0 0 1-.98-2.4H5a2 2 0 1 1 0-4h1.2a7 7 0 0 1 .98-2.4l-.85-.85a2 2 0 1 1 2.8-2.8l.85.85A7 7 0 0 1 12 6.2V5a2 2 0 0 1 2-2z",

  UserCircleIcon:
    "M12 6.75a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM4.5 19.5a7.5 7.5 0 0 1 15 0A9.75 9.75 0 0 1 12 21.75 9.75 9.75 0 0 1 4.5 19.5z",
};

// -----------------------------------------
// PERMISSION MAP
// -----------------------------------------
export const ROUTE_PERMISSION_MAP = {
  "/children": "Child Management",
  "/children/development": "Development Tracking",
  "/children/donations": "Donations",
  "/children/reports": "Reports",
  "/users": "User Management",
  "/setting": "Settings",
  // Dashboard/Alerts/Profile are open for any logged-in user:
  "/dashboard": null,
  "/children/alerts": null,
  "/profile": null,
};

// -----------------------------------------
// HELPERS
// -----------------------------------------
export const getAllRoutes = () => {
  const routes = [];

  ROUTES.forEach((item) => {
    if (item.path) routes.push(item);
    else if (item.items) routes.push(...item.items);
  });

  return routes;
};

export const getNavItems = () => {
  const navItems = [];

  ROUTES.forEach((item) => {
    if (item.path && item.showInNav) {
      navItems.push({ ...item, isStandalone: true });
    } else if (item.category && item.items) {
      navItems.push({ ...item, isCategory: true });
    }
  });

  return navItems;
};

// ✅ new: filter nav by user permissions
export const getNavItemsForUser = (user) => {
  const items = getNavItems();

  const perms = Array.isArray(user?.permissions) ? user.permissions : [];
  const hasFull = perms.includes("Full Access");

  if (hasFull) return items;

  return items.filter((it) => {
    const required = ROUTE_PERMISSION_MAP[it.path] ?? null;
    if (!required) return true; // route doesn't require permission
    return perms.includes(required);
  });
};
