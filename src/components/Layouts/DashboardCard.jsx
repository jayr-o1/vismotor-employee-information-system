import React from "react";

const DashboardCard = ({ title, value, icon, color, bgColor }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center hover:shadow-lg transition-shadow">
      <div className={`${bgColor} p-4 rounded-full mr-4`}>
        <i className={`${icon} text-2xl ${color}`}></i>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm uppercase">{title}</h3>
        <p className="text-gray-900 text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard; 