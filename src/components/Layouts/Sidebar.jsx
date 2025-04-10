import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/vismotor-corporation.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

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
      background: isDarkMode ? '#374151' : '#fff',
      color: isDarkMode ? '#fff' : '#000'
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
    <div className={`flex flex-col min-h-screen w-64 border-r-2 fixed ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-800 text-white' 
        : 'border-gray-200 bg-gray-50 text-black'
    } transition-colors duration-200`}>
      {/* Profile Picture */}
      <div className="flex flex-col items-center mt-6 space-y-3">
        <img
          className="w-24 h-24 rounded-full shadow-lg"
          src={logo}
          alt="Profile"
        />
        <span className={`text-lg font-semibold ${
          isDarkMode 
            ? 'bg-gray-700 text-white' 
            : 'bg-gray-50 text-black'
        } px-3 py-1 rounded-md`}>
          HR Department
        </span>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 pl-4 lg:pl-4 mt-5 overflow-y-auto ${
        isDarkMode 
          ? 'bg-gray-800 text-white' 
          : 'bg-gray-50 text-black'
      }`}>
        <ul className="w-full flex flex-col">
          {/* Home */}
          <li className="my-2">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDarkMode
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-home mr-4"></i> Dashboard
            </NavLink>
          </li>

          {/* Applicants */}
          <li className="my-2">
            <NavLink
              to="/applicants"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDarkMode
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-user-tie mr-4"></i> Applicants
            </NavLink>
          </li>

          {/* Onboarding */}
          <li className="my-2">
            <NavLink
              to="/onboarding"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDarkMode
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-clipboard-check mr-4"></i> Onboarding
            </NavLink>
          </li>

          {/* Staff */}
          <li className="my-2">
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDarkMode
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-id-badge mr-4"></i> Staff Directory
            </NavLink>
          </li>

          {/* Settings */}
          <li className="my-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `bg-[#0f6013] text-white border-r-4 border-green-700 hover:no-underline`
                    : isDarkMode
                      ? `text-gray-300 hover:bg-gray-700 hover:text-white hover:no-underline`
                      : `text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-cog mr-4"></i> Settings
            </NavLink>
          </li>

          {/* Divider */}
          <hr className={isDarkMode ? "bg-gray-700" : "bg-gray-100"} />

          {/* Logout */}
          <li className="my-2">
            <a
              href="#"
              id="logoutLink"
              onClick={handleLogout}
              className="flex items-center py-4 px-4 rounded-l text-red-500 hover:text-red-500 hover:no-underline hover:scale-105 transition-transform duration-200"
            >
              <i className="fas fa-sign-out-alt mr-4 text-red-500"></i> Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
