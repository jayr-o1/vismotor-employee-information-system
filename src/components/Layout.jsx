import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;