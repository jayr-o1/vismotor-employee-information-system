import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 flex items-center hover:shadow-lg transition-shadow h-full`}>
      <div className={`${bgColor} p-5 rounded-full mr-6 flex items-center justify-center min-w-[60px] min-h-[60px]`}>
        <i className={`${icon} text-3xl ${color}`}></i>
      </div>
      <div className="flex flex-col space-y-2">
        <h3 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-lg uppercase tracking-wider font-medium`}>{title}</h3>
        <p className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-3xl font-bold`}>{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard; 