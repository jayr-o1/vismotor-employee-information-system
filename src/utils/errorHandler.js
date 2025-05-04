import { showError, showLoading, closeLoading } from '../components/SweetAlerts';
import { showToast, showImportantToast } from '../components/Alerts';

/**
 * Central error handling utility for API requests
 * Uses SweetAlert for critical errors and Toast for less intrusive notifications
 */
export const handleApiError = (error, options = {}) => {
  // Default options
  const defaults = {
    title: 'Error',
    fallbackMessage: 'Something went wrong. Please try again later.',
    showSweetAlert: true,
    logToConsole: true,
    context: 'API Request', // For console logging context
  };
  
  // Merge options
  const config = { ...defaults, ...options };
  
  // Extract error message from different response formats
  let errorMessage = config.fallbackMessage;
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Log error to console if enabled
  if (config.logToConsole) {
    console.error(`${config.context} Error:`, error);
  }
  
  // Classify error type for appropriate handling
  const errorType = getErrorType(error);
  
  // Handle based on error type
  switch (errorType) {
    case 'network':
      // Network errors should get more prominent UI treatment
      if (config.showSweetAlert) {
        showError(
          'Connection Error',
          `<p>Unable to connect to the server.</p>
           <p class="mt-2 text-sm">Please check your internet connection or try again later.</p>`,
          true
        );
      } else {
        showImportantToast('Network connection issue. Please check your internet connection.', 'error');
      }
      break;
      
    case 'server':
      // Server errors (500s)
      if (config.showSweetAlert) {
        showError(
          'Server Error',
          `<p>The server encountered an error while processing your request.</p>
           <p class="mt-2 text-sm">${errorMessage}</p>`,
          true
        );
      } else {
        showToast.error(`Server error: ${errorMessage}`);
      }
      break;
      
    case 'timeout':
      // Request timeout
      if (config.showSweetAlert) {
        showError(
          'Request Timeout',
          `<p>The server took too long to respond.</p>
           <p class="mt-2 text-sm">Please try again later or contact support if this persists.</p>`,
          true
        );
      } else {
        showToast.warning('Request timed out. Please try again.');
      }
      break;
      
    case 'auth':
      // Authentication errors should be shown prominently
      showError(
        'Authentication Error',
        `<p>${errorMessage}</p>
         <p class="mt-2 text-sm">You might need to log in again.</p>`,
        true
      );
      break;
      
    case 'notFound':
      // 404 resources
      if (config.showSweetAlert) {
        showError(
          'Not Found',
          `<p>The requested resource could not be found.</p>
           <p class="mt-2 text-sm">${errorMessage}</p>`,
          true
        );
      } else {
        showToast.warning(`Resource not found: ${errorMessage}`);
      }
      break;
      
    case 'validation':
      // Validation errors (400, 422)
      if (config.showSweetAlert) {
        showError(
          'Validation Error',
          `<p>${errorMessage}</p>`,
          true
        );
      } else {
        showToast.error(errorMessage);
      }
      break;
      
    default:
      // General errors
      if (config.showSweetAlert) {
        showError(
          config.title,
          `<p>${errorMessage}</p>`,
          true
        );
      } else {
        showToast.error(errorMessage);
      }
  }
  
  // Make sure any loading dialogs are closed
  closeLoading();
  
  // Return the error message for potential use in UI
  return errorMessage;
};

/**
 * Classify the error type based on status code and error properties
 */
const getErrorType = (error) => {
  // Network errors
  if (!error.response || error.message === 'Network Error') {
    return 'network';
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return 'timeout';
  }
  
  // Based on HTTP status
  const status = error.response?.status;
  
  if (status >= 500) {
    return 'server';
  }
  
  if (status === 401 || status === 403) {
    return 'auth';
  }
  
  if (status === 404) {
    return 'notFound';
  }
  
  if (status === 400 || status === 422) {
    return 'validation';
  }
  
  // Default case
  return 'unknown';
}; 