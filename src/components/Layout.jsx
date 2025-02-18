import React from 'react';
import Header from './Layouts/Header';
import Sidebar from './Layouts/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:ml-64 ml-10 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;