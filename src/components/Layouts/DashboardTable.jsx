import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardTable = ({ data = [] }) => {
  const { isDarkMode } = useContext(ThemeContext);

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-lg`}>
        No recent applicants found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md">
      <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-collapse`}>
        <thead>
          <tr className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} uppercase text-sm leading-normal`}>
            <th className="py-4 px-6 text-left font-semibold">Name</th>
            <th className="py-4 px-6 text-left font-semibold">Position</th>
            <th className="py-4 px-6 text-left font-semibold">Status</th>
            <th className="py-4 px-6 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
          {data.map((applicant, index) => (
            <tr
              key={index}
              className={`border-b ${
                isDarkMode 
                  ? 'border-gray-700 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors duration-150`}
            >
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <span className="font-medium">{applicant.name}</span>
                </div>
              </td>
              <td className="py-4 px-6">{applicant.position}</td>
              <td className="py-4 px-6">
                <span
                  className={`py-1.5 px-4 rounded-full text-xs font-medium ${
                    applicant.status === "Pending"
                      ? isDarkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-200 text-yellow-800"
                      : applicant.status === "Approved"
                      ? isDarkMode ? "bg-green-900 text-green-200" : "bg-green-200 text-green-800"
                      : applicant.status === "Rejected"
                      ? isDarkMode ? "bg-red-900 text-red-200" : "bg-red-200 text-red-800"
                      : isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {applicant.status}
                </span>
              </td>
              <td className="py-4 px-6">
                {new Date(applicant.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable; 