import React from 'react';
import { FaExclamationTriangle, FaRedo, FaTimes } from 'react-icons/fa';

/**
 * A custom inline error message component for network and connection errors
 * with retry functionality
 */
const NetworkErrorAlert = ({ 
  message = "Failed to load data. Please check your connection.",
  onRetry,
  onDismiss,
  show = true
}) => {
  if (!show) return null;
  
  return (
    <div className="bg-white border-l-4 border-red-500 shadow-md rounded-md p-4 mb-4 mt-2 animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm leading-5 font-medium text-gray-800">
              {message}
            </p>
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Dismiss"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {onRetry && (
            <div className="mt-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-800 transition ease-in-out duration-150"
              >
                <FaRedo className="h-3 w-3 mr-1" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dark mode version of the NetworkErrorAlert component
export const DarkNetworkErrorAlert = ({ 
  message = "Failed to load data. Please check your connection.",
  onRetry,
  onDismiss,
  show = true
}) => {
  if (!show) return null;
  
  return (
    <div className="bg-gray-800 border-l-4 border-red-500 shadow-md rounded-md p-4 mb-4 mt-2 animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm leading-5 font-medium text-gray-200">
              {message}
            </p>
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {onRetry && (
            <div className="mt-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:border-red-600 focus:shadow-outline-red active:bg-red-800 transition ease-in-out duration-150"
              >
                <FaRedo className="h-3 w-3 mr-1" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorAlert; 