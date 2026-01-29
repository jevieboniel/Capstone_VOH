import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return children;

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      {/* DESKTOP SIDEBAR (does NOT scroll) */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:h-full">
        <SideNav />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/40">
            <SideNav onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN AREA (only this scrolls) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />

        {/* scroller */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
