import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../../styles/header.css'; // Import the CSS for the toggle switch

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Initialize dark mode based on localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedMode === null) {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', newMode);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  return (
    <header className="bg-gray-50 p-4 w-full z-40 fixed top-0 left-0 lg:ml-64 ml-10 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
      <div className="flex start items-center w-full">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 my-4 relative">
          {/* Clear Button (visible only when search input has value) */}
          {searchValue && (
            <button
              id="clear-btn"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {/* Dark Mode Toggle */}
        <label className="toggle-switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
          <span className="slider"></span>
        </label>
      </div>
    </header>
  );
};

export default Header;