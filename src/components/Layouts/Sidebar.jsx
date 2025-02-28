import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/vismotor-corporation.png";
import Swal from "sweetalert2";
import { ThemeContext } from "../../ThemeContext";

import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate(); // Initialize useNavigate

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
    <div
      className={`flex flex-col min-h-screen w-64 border-r-2 fixed border-gray-200'}`}
    >
      {/* Profile Picture */}
      <div className="flex flex-col items-center mt-6 space-y-3">
        <img
          className="w-24 h-24 rounded-full shadow-lg"
          src={logo}
          alt="Profile"
        />
        <span
          className={`text-lg font-semibold ${
            isDarkMode
              ? "dark:bg-gray-800 dark:text-white"
              : "bg-gray-50 text-black"
          } px-3 py-1 rounded-md`}
        >
          IT Department
        </span>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 pl-4 lg:pl-4 mt-5 overflow-y-auto ${
          isDarkMode
            ? "dark:bg-gray-800 dark:text-white"
            : "bg-gray-50 text-black"
        }`}
      >
        <ul className="w-full flex flex-col">
          {/* Home */}
          <li className="my-2">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `${
                        isDarkMode
                          ? "dark:bg-green-700 dark:text-white"
                          : "bg-[#0f6013] text-white"
                      } border-r-4 border-green-700 hover:no-underline`
                    : `${
                        isDarkMode ? "dark:text-gray-300" : "text-gray-500"
                      } hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-home mr-4"></i> Home
            </NavLink>
          </li>

          {/* Employees */}
          <li className="my-2">
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `${
                        isDarkMode
                          ? "dark:bg-green-700 dark:text-white"
                          : "bg-[#0f6013] text-white"
                      } border-r-4 border-green-700 hover:no-underline`
                    : `${
                        isDarkMode ? "dark:text-gray-300" : "text-gray-500"
                      } hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-id-badge mr-4"></i> Employees
            </NavLink>
          </li>

          {/* Scan QR */}
          <li className="my-2">
            <NavLink
              to="/scan-qr"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `${
                        isDarkMode
                          ? "dark:bg-green-700 dark:text-white"
                          : "bg-[#0f6013] text-white"
                      } border-r-4 border-green-700 hover:no-underline`
                    : `${
                        isDarkMode ? "dark:text-gray-300" : "text-gray-500"
                      } hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-qrcode mr-4"></i> Scan QR
            </NavLink>
          </li>

          {/* Settings */}
          <li className="my-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center py-4 px-4 rounded-l ${
                  isActive
                    ? `${
                        isDarkMode
                          ? "dark:bg-green-700 dark:text-white"
                          : "bg-[#0f6013] text-white"
                      } border-r-4 border-green-700 hover:no-underline`
                    : `${
                        isDarkMode ? "dark:text-gray-300" : "text-gray-500"
                      } hover:bg-gray-200 hover:text-gray-500 hover:no-underline`
                }`
              }
            >
              <i className="fas fa-cog mr-4"></i> Settings
            </NavLink>
          </li>

          {/* Divider */}
          <hr
            className={`${isDarkMode ? "dark:bg-gray-600" : "bg-gray-100"}`}
          />

          {/* Logout */}
          <li className="my-2">
            <a
              href="#"
              id="logoutLink"
              onClick={handleLogout}
              className={`flex items-center py-4 px-4 rounded-l ${
                isDarkMode ? "text-gray-300" : "text-red-500"
              } hover:text-red-500 hover:no-underline hover:scale-105 transition-transform duration-200`}
            >
              <i
                className={`fas fa-sign-out-alt mr-4 ${
                  isDarkMode ? "text-gray-300" : "text-red-500"
                }`}
              ></i>{" "}
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
