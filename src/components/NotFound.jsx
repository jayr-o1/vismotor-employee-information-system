import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

const NotFound = ({ errorCode = 404, errorMessage = "Page Not Found" }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const location = useLocation();
  
  // If URL includes error code, extract it
  const urlErrorCode = location.search.match(/code=(\d+)/)?.[1];
  const displayErrorCode = urlErrorCode || errorCode;
  
  const getErrorMessage = (code) => {
    switch (parseInt(code)) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Page Not Found";
      case 500:
        return "Internal Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      default:
        return errorMessage;
    }
  };
  
  const displayMessage = getErrorMessage(displayErrorCode);
  
  return (
    <div className={`flex items-center justify-center min-h-screen ${
      isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <div className={`text-center p-8 rounded-lg shadow-lg max-w-md w-full ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        <div className="relative mb-8">
          <h1 className={`text-8xl font-bold mb-1 ${
            isDark ? 'text-red-500' : 'text-red-600'
          }`}>{displayErrorCode}</h1>
          <div className={`w-16 h-1 mx-auto rounded-full ${
            isDark ? 'bg-red-700' : 'bg-red-200'
          }`}></div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">{displayMessage}</h2>
        <p className={`mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to="/home"
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
            isDark 
              ? 'bg-green-700 text-white hover:bg-green-600' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <i className="fas fa-home mr-2"></i>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 