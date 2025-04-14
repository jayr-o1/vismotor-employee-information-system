import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-6 ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
          }`}>{title}</h3>
          <p className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-full`}>
          <i className={`${icon} text-2xl ${color}`}></i>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard; 