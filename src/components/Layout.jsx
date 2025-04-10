import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

const Layout = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} transition-colors duration-200`}>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;