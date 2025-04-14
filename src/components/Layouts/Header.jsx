import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchValue, setSearchValue] = useState('');
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
    <header className={`px-4 py-3 w-full z-40 fixed top-0 right-0 left-0 lg:left-64 border-b border-gray-200 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    }`}>
      <div className="flex justify-between items-center">
        {/* Title */}
        <h1 className="text-xl font-bold hidden lg:block">HR Recruitment & Onboarding System</h1>
        
        <div className="flex items-center ml-auto gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <div className={`flex items-center rounded-full overflow-hidden border ${
              isSearchFocused 
                ? 'border-green-500 shadow-sm' 
                : theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            } px-3 py-1.5 transition-all duration-200 sm:w-40 md:w-48 lg:w-60`}>
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`outline-none w-full ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
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