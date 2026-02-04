import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("admin_user", JSON.stringify(data.user));
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || data.message || "Invalid email or password" };
      }

      if (data.user.status && data.user.status !== "Active") {
        return { success: false, error: `Account is ${data.user.status}. Contact admin.` };
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Server error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  // ✅ supports JSON AND FormData
    const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("admin_token");

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    // ✅ If body is FormData, DO NOT set Content-Type (browser will set it)
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });
  };


  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
