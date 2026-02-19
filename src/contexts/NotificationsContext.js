// src/contexts/NotificationsContext.js
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

// ✅ helper: get token from common keys (admin + other roles)
function getAnyToken() {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("user_token") ||
    null
  );
}

export function NotificationsProvider({ children }) {
  const { authFetch, user } = useAuth();
  const socketRef = useRef(null);

  const [enabledTypes, setEnabledTypes] = useState(new Set());
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rt_notifications") || "[]");
    } catch {
      return [];
    }
  });

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // ✅ Load enabled notification types from Settings (notifState)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await authFetch("/settings", { method: "GET" });
        const data = await res.json();

        if (!mounted) return;

        const set = new Set(
          (data?.notifState || [])
            .filter((x) => x.enabled)
            .map((x) => x.type)
        );

        setEnabledTypes(set);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authFetch]);

  // ✅ Connect socket once logged in (ALL ROLES)
  useEffect(() => {
    const token = getAnyToken();
    if (!token || !user?.id) return;

    // prevent double connection
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch {}
      socketRef.current = null;
    }

    const s = createSocket(token);
    socketRef.current = s;

    s.on("connect", () => {
      // optional debug:
      // console.log("✅ socket connected", s.id, user?.role);
    });

    s.on("socket:ready", (info) => {
      // optional debug:
      // console.log("✅ socket ready:", info);
    });

    s.on("connect_error", (err) => {
      console.error("Socket error:", err?.message || err);
    });

    s.on("notification:new", (notif) => {
      // Client safety: ignore if disabled in Settings UI
      if (enabledTypes.size && notif?.type && !enabledTypes.has(notif.type)) return;

      setItems((prev) => {
        const next = [{ ...notif, read: false }, ...prev].slice(0, 50);
        localStorage.setItem("rt_notifications", JSON.stringify(next));
        return next;
      });
    });

    return () => {
      try {
        s.off("connect_error");
        s.off("notification:new");
        s.off("socket:ready");
        s.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [user?.id, user?.role, enabledTypes]);

  const markAllRead = () => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("rt_notifications", JSON.stringify(next));
      return next;
    });
  };

  const clearAll = () => {
    setItems([]);
    localStorage.setItem("rt_notifications", "[]");
  };

  const value = useMemo(() => ({ items, unread, markAllRead, clearAll }), [items, unread]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
