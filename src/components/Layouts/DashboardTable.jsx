import React, { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const DashboardTable = ({ data = [] }) => {
  const { isDarkMode } = useContext(ThemeContext);

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-lg`}>
        No recent applicants found.
import { Link } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";

const DashboardTable = ({ data = [] }) => {
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
    <div className="overflow-x-auto rounded-lg">
      <table className={`min-w-full ${isDark ? 'bg-gray-700 text-white' : 'bg-white'}`}>
        <thead>
          <tr className={isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}>
            <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Name</th>
            <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Position</th>
            <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Status</th>
            <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                }`}>Date</th>
          </tr>
        </thead>
        <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
          {data.map((applicant, index) => (
            <tr
              key={index}
              className={isDark 
                ? 'hover:bg-gray-600 transition-colors duration-150' 
                : 'hover:bg-gray-50 transition-colors duration-150'
              }
            >
              <td className="py-4 px-4 whitespace-nowrap">
                <Link to={`/applicants/${applicant.id}`} className="text-[#0f6013] hover:text-[#0c4e10] hover:underline font-medium">
                  {applicant.name}
                </Link>
              </td>
              <td className={`py-4 px-4 whitespace-nowrap text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{applicant.position}</td>
              <td className="py-4 px-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
              </td>
              <td className="py-4 px-6">
              <td className={`py-4 px-4 whitespace-nowrap text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
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