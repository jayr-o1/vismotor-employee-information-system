import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Layouts/Sidebar";
import { ThemeContext } from "../ThemeContext";

const Layout = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1B2537]' : 'bg-gray-100'}`}>
      <div className={`flex min-h-screen ${isDark ? 'bg-[#1B2537]' : 'bg-gray-100'}`}>
        {/* Fixed width sidebar - no longer collapsible */}
        <div className="sidebar-container fixed h-full z-50 w-64">
          {/* Pass fixed collapsed=false to Sidebar component */}
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 ml-0 lg:ml-64 transition-all duration-300">
          {/* Main content area with adjusted padding */}
          <main className={`flex-1 p-4 sm:p-6 overflow-y-auto transition-colors duration-200 ${
            isDark ? 'bg-[#1B2537] text-white' : 'bg-gray-100 text-gray-800'
          }`}>
            <div className="container mx-auto px-0 sm:px-2">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;