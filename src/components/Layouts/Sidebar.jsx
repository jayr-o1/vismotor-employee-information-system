import { NavLink } from "react-router-dom";

import logo from "../../assets/vismotor-corporation.png";

const Sidebar = () => {
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
        window.location.href = e.target.href; // Redirect to logout URL
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen w-64 border-r-2 border-gray-200 dark:border-gray-700 bg-gray-50 fixed">
      {/* SpendWise Title */}
      <div className="text-center -mt-20 -mb-20">
        <img
          src={logo}
          alt="Vismotor Logo"
          className="mx-auto h-64 w-auto"
        />
      </div>

      {/* Profile Picture */}
      <div className="text-center mt-5">
        <img
          className="w-20 h-20 rounded-full mx-auto"
          src={logo}
          alt="Profile Picture"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 pl-4 lg:pl-4 mt-5 overflow-y-auto bg-gray-50">
        <ul className="w-full flex flex-col">
          {/* Home */}
          <li className="my-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? "bg-blue-500 text-white border-r-4 border-blue-200 hover:no-underline"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline"
                }`
              }
            >
              <i className="fas fa-home mr-4"></i> Home
            </NavLink>
          </li>

          {/* Wallet */}
          <li className="my-2">
            <NavLink
              to="/wallet"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? "bg-blue-500 text-white border-r-4 border-blue-200 hover:no-underline"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline"
                }`
              }
            >
              <i className="fas fa-wallet mr-4"></i> Wallet
            </NavLink>
          </li>

          {/* Category */}
          <li className="my-2">
            <NavLink
              to="/category"
              className={({ isActive }) =>
                `flex items-center py-3 pl-4 rounded-l ${
                  isActive
                    ? "bg-blue-500 text-white border-r-4 border-blue-200 hover:no-underline"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline"
                }`
              }
            >
              <i className="fas fa-layer-group mr-4"></i> Category
            </NavLink>
          </li>

          {/* Transaction */}
          <li className="my-2">
            <NavLink
              to="/scan-qr"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? "bg-blue-500 text-white border-r-4 border-blue-200 hover:no-underline"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline"
                }`
              }
            >
              <i className="fas fa-file-invoice-dollar mr-4"></i> Scan QR
            </NavLink>
          </li>

          {/* Settings */}
          <li className="my-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-l ${
                  isActive
                    ? "bg-blue-500 text-white border-r-4 border-blue-200 hover:no-underline"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-500 hover:no-underline"
                }`
              }
            >
              <i className="fas fa-cog mr-4"></i> Settings
            </NavLink>
          </li>

          {/* Divider */}
          <hr className="bg-gray-100 dark:bg-gray-600" />

          {/* Logout */}
          <li className="my-2">
            <a
              href="/account/signout"
              id="logoutLink"
              onClick={handleLogout}
              className="flex items-center py-3 px-4 rounded-l text-red-500 dark:text-gray-500 hover:text-red-500 hover:no-underline hover:scale-105 transition-transform duration-200"
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
