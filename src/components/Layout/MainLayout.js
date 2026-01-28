import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SideNav from './SideNav';
import TopNav from './TopNav';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return children;

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* DESKTOP SIDEBAR (does NOT scroll) */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:h-full">
        <SideNav />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Sidebar panel */}
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <SideNav onClose={() => setIsSidebarOpen(false)} />
          </div>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* MAIN AREA (only this scrolls) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />

        {/* scroller */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
