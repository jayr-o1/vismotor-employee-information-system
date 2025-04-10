import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../ThemeContext';

const Header = () => {
  const [searchValue, setSearchValue] = useState('');
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  return (
    <header className={`py-4 px-6 w-full z-50 fixed top-0 left-0 lg:ml-64 ml-10 border-b backdrop-blur-md ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-900/95 text-white' 
        : 'border-gray-200 bg-gray-50/95 text-black'
    } transition-colors duration-200`}>
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left section with toggle */}
        <div className="flex items-center">
          <label htmlFor="darkModeToggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="darkModeToggle" 
                type="checkbox" 
                className="sr-only" 
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
              <div className={`block w-14 h-7 rounded-full ${isDarkMode ? 'bg-green-600' : 'bg-gray-400'} transition-colors duration-300 shadow-inner`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 transform ${isDarkMode ? 'translate-x-7' : ''} flex items-center justify-center shadow-md`}>
                <i className={`text-xs ${isDarkMode ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-gray-400'}`}></i>
              </div>
            </div>
            <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </label>
        </div>
        
        {/* Middle section with title */}
        <div className="flex justify-center">
          <h1 className="text-xl font-bold text-center">HR Recruitment & Onboarding System</h1>
        </div>
        
        {/* Right section - empty for balance */}
        <div className="flex justify-end">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 relative">
            {searchValue && (
              <button
                id="clear-btn"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;