import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../../styles/toggle.css'; // Import the CSS for the toggle switch

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [searchValue, setSearchValue] = useState('');

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  return (
    <header className={`p-4 w-full z-40 fixed top-0 left-0 lg:ml-64 ml-10 border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}>
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
        <label className="toggle-switch flex items-center space-x-2">
          <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
          <span className="slider"></span>
          {isDarkMode ? <FaMoon className="text-yellow-500" /> : <FaSun className="text-yellow-500" />}
        </label>
      </div>
    </header>
  );
};

export default Header;