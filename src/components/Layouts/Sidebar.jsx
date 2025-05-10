import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";
import sidebarBanner from "../../assets/vismotor_banner.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [user, setUser] = useState(null);

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Logout confirmation dialog
  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#a6a6a6",
      confirmButtonText: "Logout",
      background: isDark ? '#374151' : '#fff',
      color: isDark ? '#fff' : '#000'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear authentication data
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");

        // Redirect to login page
        navigate("/login");
      }
    });
  };

  // Theme-based sidebar colors
  const sidebarBg = isDark ? 'bg-[#1B2537]' : 'bg-white'; // Dark gray for dark mode, light gray for light mode
  const activeBg = 'bg-[#0e8631]';  // Green background for active items
  const activeIndicator = 'border-r-4 border-[#0a6623]'; // Darker green for the active border
  const activeText = 'text-white'; // Always white text for active items
  const sidebarText = isDark ? 'text-white' : 'text-gray-800';
  const inactiveText = isDark ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200';
  const dividerColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const profileBannerBg = isDark ? 'bg-gray-700' : 'bg-white';

  return (
    <div className={`flex flex-col min-h-screen border-r fixed z-50 w-64 ${sidebarBg} ${sidebarText} ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200 overflow-hidden`}>
      {/* Banner Image */}
      <div className="w-full -mx-[1px]">
        <img 
          src={sidebarBanner} 
          alt="Vismotor" 
          className="w-[calc(100%+2px)] object-cover"
        />
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 px-0 overflow-y-auto ${sidebarBg}`}>
        <ul className="w-full flex flex-col">
          {/* Home */}
          <li className="my-0">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center py-3 px-6 w-full ${
                  isActive
                    ? `${activeBg} ${activeText} ${activeIndicator} hover:no-underline`
                    : `${inactiveText} ${hoverBg} ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} hover:no-underline`
                }`
              }
              title="Dashboard"
            >
              <i className="fas fa-home w-5 text-center mr-4"></i>
              Dashboard
            </NavLink>
          </li>

          {/* Applicants */}
          <li className="my-0">
            <NavLink
              to="/applicants"
              className={({ isActive }) =>
                `flex items-center py-3 px-6 w-full ${
                  isActive
                    ? `${activeBg} ${activeText} ${activeIndicator} hover:no-underline`
                    : `${inactiveText} ${hoverBg} ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} hover:no-underline`
                }`
              }
              title="Applicants"
            >
              <i className="fas fa-user-tie w-5 text-center mr-4"></i>
              Applicants
            </NavLink>
          </li>

          {/* Onboarding */}
          <li className="my-0">
            <NavLink
              to="/onboarding"
              className={({ isActive }) =>
                `flex items-center py-3 px-6 w-full ${
                  isActive
                    ? `${activeBg} ${activeText} ${activeIndicator} hover:no-underline`
                    : `${inactiveText} ${hoverBg} ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} hover:no-underline`
                }`
              }
              title="Onboarding"
            >
              <i className="fas fa-clipboard-check w-5 text-center mr-4"></i>
              Onboarding
            </NavLink>
          </li>

          {/* Staff */}
          <li className="my-0">
            <NavLink
              to="/hr-staff"
              className={({ isActive }) =>
                `flex items-center py-3 px-6 w-full ${
                  isActive
                    ? `${activeBg} ${activeText} ${activeIndicator} hover:no-underline`
                    : `${inactiveText} ${hoverBg} ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} hover:no-underline`
                }`
              }
              title="HR Staff Directory"
            >
              <i className="fas fa-id-badge w-5 text-center mr-4"></i> 
              HR Staff Directory
            </NavLink>
          </li>

          {/* Divider */}
          <hr className={`my-3 ${dividerColor}`} />
          
          {/* Profile Banner */}
          {user && (
            <li className="my-2">
              <div className={`p-3 ${profileBannerBg}`}>
                <div className="flex items-center justify-center mb-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0e8631] flex items-center justify-center text-lg font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="text-center mb-2">
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium text-xs`}>{user.name || 'User'}</p>
                </div>
                <div className="flex justify-center space-x-6">
                  <NavLink
                    to="/settings"
                    title="Settings"
                    className={({ isActive }) =>
                      isActive
                        ? isDark ? "text-white hover:scale-105 transition-transform duration-200" : "text-gray-800 hover:scale-105 transition-transform duration-200"
                        : isDark ? "text-gray-300 hover:text-white hover:scale-105 transition-transform duration-200" : "text-gray-600 hover:text-gray-900 hover:scale-105 transition-transform duration-200"
                    }
                  >
                    <i className="fas fa-cog"></i>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="text-red-400 hover:text-red-300 hover:scale-105 transition-transform duration-200"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;