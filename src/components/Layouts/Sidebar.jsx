import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/vismotor-corporation.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

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

        // Redirect to login page
        navigate("/login");
      }
    });
  };

  return (
    <div className={`flex flex-col min-h-screen border-r-2 fixed z-50 w-64 ${
      isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-black'
    } transition-colors duration-200`}>
      {/* Profile Picture */}
      <div className="flex flex-col items-center pt-6 pb-4 space-y-3 px-3">
        <img
          className="rounded-full shadow-lg w-24 h-24"
          src={logo}
          alt="Profile"
        />
        <span className={`text-lg font-semibold px-3 py-1 rounded-md ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          HR Department
        </span>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-4 mt-3 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <ul className="w-full flex flex-col">
          {/* Home */}
          <li className="my-1">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDark
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
              title="Dashboard"
            >
              <i className="fas fa-home mr-4"></i>
              Dashboard
            </NavLink>
          </li>

          {/* Applicants */}
          <li className="my-1">
            <NavLink
              to="/applicants"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDark
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
              title="Applicants"
            >
              <i className="fas fa-user-tie mr-4"></i>
              Applicants
            </NavLink>
          </li>

          {/* Onboarding */}
          <li className="my-1">
            <NavLink
              to="/onboarding"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDark
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
              title="Onboarding"
            >
              <i className="fas fa-clipboard-check mr-4"></i>
              Onboarding
            </NavLink>
          </li>

          {/* Staff */}
          <li className="my-1">
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDark
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
              title="Staff Directory"
            >
              <i className="fas fa-id-badge mr-4"></i> 
              Staff Directory
            </NavLink>
          </li>

          {/* Settings */}
          <li className="my-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDark
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
              title="Settings"
            >
              <i className="fas fa-cog mr-4"></i>
              Settings
            </NavLink>
          </li>

          {/* Divider */}
          <hr className={`my-3 ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />

          {/* Logout */}
          <li className="my-1">
            <a
              href="#"
              id="logoutLink"
              onClick={handleLogout}
              title="Logout"
              className="flex items-center py-3 px-4 rounded-l text-red-500 hover:text-red-500 hover:no-underline hover:scale-105 transition-transform duration-200"
            >
              <i className="fas fa-sign-out-alt text-red-500 mr-4"></i>
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
