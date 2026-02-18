// src/contexts/NotificationsContext.js
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

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

  // Load enabled notification types from Settings (notifState)
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
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authFetch]);

  // Connect socket once logged in
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token || !user) return;

    const s = createSocket(token);
    socketRef.current = s;

    s.on("connect_error", (err) => {
      console.error("Socket error:", err?.message || err);
    });

    s.on("notification:new", (notif) => {
      // Extra safety: if Settings disabled in UI, ignore on client too
      if (enabledTypes.size && notif?.type && !enabledTypes.has(notif.type)) return;

      setItems((prev) => {
        const next = [{ ...notif, read: false }, ...prev].slice(0, 50);
        localStorage.setItem("rt_notifications", JSON.stringify(next));
        return next;
      });
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user, enabledTypes]);

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

  const value = useMemo(
    () => ({ items, unread, markAllRead, clearAll }),
    [items, unread]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
