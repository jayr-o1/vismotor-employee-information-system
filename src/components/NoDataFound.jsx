import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const NoDataFound = ({ 
  message = "No data found", 
  subText = "The requested information is not available.",
  icon = "database" 
}) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${
      isDark ? 'text-gray-300' : 'text-gray-700'
    }`}>
      <div className={`inline-flex items-center justify-center rounded-full w-20 h-20 mb-6 ${
        isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-100 text-blue-500'
      }`}>
        <i className={`fas fa-${icon} text-3xl`}></i>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      
      <p className={`max-w-sm ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {subText}
      </p>
    </div>
  );
};

export default NoDataFound; 