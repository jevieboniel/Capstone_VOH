    import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

    const ThemeContext = createContext(null);

    export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    // Load saved theme on first mount
    useEffect(() => {
        const saved = localStorage.getItem("theme"); // "dark" | "light" | null
        const prefersDark =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

        const shouldUseDark = saved ? saved === "dark" : prefersDark;
        setDarkMode(shouldUseDark);
    }, []);

    // Apply theme to <html> and save preference
    useEffect(() => {
        const root = document.documentElement; // <html>
        if (darkMode) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
        } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const value = useMemo(
        () => ({
        darkMode,
        setDarkMode,
        toggleTheme: () => setDarkMode((v) => !v),
        }),
        [darkMode]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
    }

    export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
    }
