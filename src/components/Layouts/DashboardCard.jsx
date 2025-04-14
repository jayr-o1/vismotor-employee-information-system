import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardCard = ({ title, value, icon, color, trend }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // Color mapping for different card types
  const getColors = () => {
    switch (color) {
      case 'blue':
        return {
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          border: isDark ? 'border-blue-800/30' : 'border-blue-100',
          text: isDark ? 'text-blue-400' : 'text-blue-600',
          icon: isDark ? 'text-blue-400' : 'text-blue-600'
        };
      case 'yellow':
        return {
          bg: isDark ? 'bg-amber-900/20' : 'bg-amber-50',
          border: isDark ? 'border-amber-800/30' : 'border-amber-100',
          text: isDark ? 'text-amber-400' : 'text-amber-600',
          icon: isDark ? 'text-amber-400' : 'text-amber-600'
        };
      case 'red':
        return {
          bg: isDark ? 'bg-red-900/20' : 'bg-red-50',
          border: isDark ? 'border-red-800/30' : 'border-red-100',
          text: isDark ? 'text-red-400' : 'text-red-600',
          icon: isDark ? 'text-red-400' : 'text-red-600'
        };
      default:
        return {
          bg: isDark ? 'bg-emerald-900/20' : 'bg-emerald-50',
          border: isDark ? 'border-emerald-800/30' : 'border-emerald-100',
          text: isDark ? 'text-emerald-400' : 'text-emerald-600',
          icon: isDark ? 'text-emerald-400' : 'text-emerald-600'
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <div className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border ${
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {title.toUpperCase()}
          </p>
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <i className={`${icon} ${colors.icon}`}></i>
          </div>
        </div>
        <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </h3>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center ${
              isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <i className="fas fa-arrow-up mr-0.5"></i>{trend.value}%
            </span>
            <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              vs last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard; 