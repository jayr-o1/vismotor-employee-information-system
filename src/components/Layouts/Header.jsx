import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../ThemeContext';

const Header = () => {
  const [searchValue, setSearchValue] = useState('');

  // Clear search input
  const clearSearch = () => {
    setSearchValue('');
  };

  return (
    <header className="p-4 w-full z-40 fixed top-0 left-0 lg:ml-64 ml-10 border-b border-gray-200 bg-gray-50 text-black">
      <div className="flex justify-between items-center w-full">
        {/* Title */}
        <h1 className="text-xl font-bold hidden md:block">HR Recruitment & Onboarding System</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 my-4 relative">
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