// src/components/UI/PermissionRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const hasFullAccess = (user) => (user?.permissions || []).includes("Full Access");
const hasPermission = (user, perm) => {
  if (!perm) return true;
  if (hasFullAccess(user)) return true;
  return (user?.permissions || []).includes(perm);
};

export default function PermissionRoute({ permission, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (!hasPermission(user, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
