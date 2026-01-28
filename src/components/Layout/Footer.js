import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 lg:px-6">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-2 lg:space-y-0">
        <p className="text-xs lg:text-sm text-gray-600 text-center lg:text-left">
          © 2026 AdminDashboard. All rights reserved.
        </p>
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Privacy Policy
          </button>
          <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Terms of Service
          </button>
          <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Help
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
