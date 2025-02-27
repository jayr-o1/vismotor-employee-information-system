import React, { useContext } from 'react';
import Header from './Layouts/Header';
import Sidebar from './Layouts/Sidebar';
import { ThemeContext } from '../ThemeContext';

const Layout = ({ children }) => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-100 text-black'}`}>
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