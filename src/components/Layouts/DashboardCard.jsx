import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardCard = ({ title, value, icon, color, trend }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // Generate background color based on the color prop
  const getBgColor = () => {
    if (isDark) {
      switch(color) {
        case 'blue': return 'bg-blue-900/20 border-blue-800/30';
        case 'green': return 'bg-emerald-900/20 border-emerald-800/30';
        case 'red': return 'bg-red-900/20 border-red-800/30';
        case 'yellow': return 'bg-amber-900/20 border-amber-800/30';
        case 'purple': return 'bg-purple-900/20 border-purple-800/30';
        default: return 'bg-slate-800 border-slate-700';
      }
    } else {
      switch(color) {
        case 'blue': return 'bg-blue-50 border-blue-100';
        case 'green': return 'bg-emerald-50 border-emerald-100';
        case 'red': return 'bg-red-50 border-red-100';
        case 'yellow': return 'bg-amber-50 border-amber-100';
        case 'purple': return 'bg-purple-50 border-purple-100';
        default: return 'bg-white border-gray-200';
      }
    }
  };

  // Generate text color based on the color prop
  const getTextColor = () => {
    if (isDark) {
      switch(color) {
        case 'blue': return 'text-blue-400';
        case 'green': return 'text-emerald-400';
        case 'red': return 'text-red-400';
        case 'yellow': return 'text-amber-400';
        case 'purple': return 'text-purple-400';
        default: return 'text-slate-300';
      }
    } else {
      switch(color) {
        case 'blue': return 'text-blue-600';
        case 'green': return 'text-emerald-600';
        case 'red': return 'text-red-600';
        case 'yellow': return 'text-amber-600';
        case 'purple': return 'text-purple-600';
        default: return 'text-slate-600';
      }
    }
  };

  // Generate icon color based on the color prop
  const getIconBgColor = () => {
    if (isDark) {
      switch(color) {
        case 'blue': return 'bg-blue-800/30 text-blue-300';
        case 'green': return 'bg-emerald-800/30 text-emerald-300';
        case 'red': return 'bg-red-800/30 text-red-300';
        case 'yellow': return 'bg-amber-800/30 text-amber-300';
        case 'purple': return 'bg-purple-800/30 text-purple-300';
        default: return 'bg-slate-700 text-slate-300';
      }
    } else {
      switch(color) {
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'green': return 'bg-emerald-100 text-emerald-600';
        case 'red': return 'bg-red-100 text-red-600';
        case 'yellow': return 'bg-amber-100 text-amber-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        default: return 'bg-slate-100 text-slate-600';
      }
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-md border ${getBgColor()} transition-colors duration-200`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${getTextColor()}`}>{title}</h2>
            <h3 className={`mt-1 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
            {trend && (
              <p className="mt-2 flex items-center text-xs font-medium">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${
                  trend.isUpward 
                    ? isDark ? 'bg-emerald-800/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                    : isDark ? 'bg-red-800/30 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  <i className={`fas fa-arrow-${trend.isUpward ? 'up' : 'down'} mr-1 w-3 h-3`}></i>
                  {trend.value}%
                </span>
                <span className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>vs last month</span>
              </p>
            )}
          </div>
          <div className={`rounded-full p-3 ${getIconBgColor()}`}>
            <i className={`${icon} text-lg`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard; 