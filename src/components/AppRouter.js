// src/components/AppRouter.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAllRoutes, ROUTE_PERMISSION_MAP } from "../config/routes";
import MainLayout from "./Layout/MainLayout";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Users from "./Pages/Users";
import Children from "./Pages/Children";
import Development from "./Pages/Development";
import Alerts from "./Pages/Alerts";
import Donations from "./Pages/Donations";
import Reports from "./Pages/Reports";
import Setting from "./Pages/Setting";
import Profile from "./Pages/Profile";

import DonateCheckout from "./Pages/DonateCheckout";
import DonateSuccess from "./Pages/DonateSuccess";

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Settings</h1>
  </div>
);

const componentMap = {
  Dashboard,
  Children,
  Development,
  Alerts,
  Donations,
  Reports,
  Users,
  Setting,
  Settings,
  Profile,
};

const hasFullAccess = (user) => Array.isArray(user?.permissions) && user.permissions.includes("Full Access");

const hasPermission = (user, perm) => {
  if (!perm) return true;
  if (hasFullAccess(user)) return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(perm);
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

const PermissionRoute = ({ permission, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasPermission(user, permission)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default function AppRouter() {
  const allRoutes = getAllRoutes();

  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ✅ Public donation pages */}
      <Route path="/donate" element={<DonateCheckout />} />
      <Route path="/donate-success" element={<DonateSuccess />} />

      {/* PROTECTED */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                {allRoutes.map((route) => {
                  const Component = componentMap[route.component];
                  const requiredPerm = ROUTE_PERMISSION_MAP[route.path] ?? null;

                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <PermissionRoute permission={requiredPerm}>
                          {Component ? <Component /> : <div>Component not found</div>}
                        </PermissionRoute>
                      }
                    />
                  );
                })}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
