import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchValue, setSearchValue] = useState('');
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Searching for:', searchValue);
      // Implement actual search functionality here
    }
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
    <header className={`px-4 py-3 w-full z-40 fixed top-0 right-0 left-0 lg:left-64 border-b ${
      theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'
    }`}>
      <div className="flex justify-between items-center">
        {/* Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">HR Recruitment & Onboarding System</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <div className={`flex items-center rounded-full overflow-hidden border ${
              isSearchFocused 
                ? 'border-green-500 shadow-sm' 
                : theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            } px-3 py-1.5 transition-all duration-200 sm:w-40 md:w-48 lg:w-64`}>
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`outline-none w-full text-sm ${
                  theme === 'dark' ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'
                }`}
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0"
                >
                  <i className="fas fa-times"></i>
                </button>
              ) : (
                <span className="text-gray-400 ml-1 flex-shrink-0">
                  <i className="fas fa-search"></i>
                </span>
              )}
            </div>
          </form>
          
          {/* Search Icon for Mobile */}
          <button 
            className="sm:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => alert('Mobile search coming soon!')}
          >
            <i className="fas fa-search"></i>
          </button>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;