import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-2 lg:px-6 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-2 lg:space-y-0">
        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 text-center lg:text-left">
          © 2026 AdminDashboard. All rights reserved.
        </p>

        <div className="flex items-center space-x-3 lg:space-x-4">
          <button className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Privacy Policy
          </button>

          <button className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Terms of Service
          </button>

          <button className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Help
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
