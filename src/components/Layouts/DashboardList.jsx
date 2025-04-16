import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";

const DashboardList = ({ data = [] }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-lg ${
        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'
      }`}>
        <i className={`fas fa-inbox text-4xl mb-3 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}></i>
        <p>No recent applicants found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={`grid grid-cols-3 text-xs font-medium uppercase tracking-wider px-3 py-2 ${
        isDark ? 'text-gray-300' : 'text-gray-500'
      }`}>
        <div>Name</div>
        <div>Position</div>
        <div>Status</div>
      </div>
      
      {/* List items */}
      <ul className="space-y-2">
        {data.map((applicant, index) => (
          <li 
            key={index} 
            className={`rounded-lg p-3 shadow-sm ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
            } transition-colors duration-150`}
          >
            <Link to={`/applicants/${applicant.id}`} className="block">
              <div className="grid grid-cols-3 items-center">
                {/* Name with avatar */}
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold ${
                    isDark ? 'bg-green-700' : 'bg-green-600'
                  }`}>
                    {applicant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-medium truncate ${
                    isDark ? 'text-white hover:text-green-300' : 'text-gray-800 hover:text-green-600'
                  }`}>
                    {applicant.name}
                  </span>
                </div>
                
                {/* Position */}
                <div className={`text-sm truncate ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {applicant.position}
                </div>
                
                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      applicant.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : applicant.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : applicant.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : applicant.status === "Interviewed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${
                      applicant.status === "Pending"
                        ? "bg-yellow-400"
                        : applicant.status === "Approved"
                        ? "bg-green-400"
                        : applicant.status === "Rejected"
                        ? "bg-red-400"
                        : applicant.status === "Interviewed"
                        ? "bg-blue-400"
                        : "bg-gray-400"
                    }`}></span>
                    {applicant.status}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Pagination indicator */}
      <div className="flex justify-center items-center pt-2">
        <button className="text-gray-500 p-1 rounded hover:bg-gray-200 mr-2">
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          {data.length > 0 ? `1-${data.length} of ${data.length}` : '0 items'}
        </span>
        <button className="text-gray-500 p-1 rounded hover:bg-gray-200 ml-2">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DashboardList; 