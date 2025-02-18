import React, { useState } from 'react';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  return (
    <header className="bg-gray-50 p-4 w-full z-40 fixed top-0 left-0 lg:ml-64 ml-10 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center w-full">
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
      </div>
    </header>
  );
};

export default Header;