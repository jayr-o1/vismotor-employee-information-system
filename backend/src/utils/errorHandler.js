/**
 * Utility functions for standardized error handling
 */

/**
 * Generate a standardized error response
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error doesn't have one
 * @param {number} statusCode - HTTP status code to return
 * @returns {Object} Standardized error response object
 */
const formatErrorResponse = (error, defaultMessage = 'An unexpected error occurred', statusCode = 500) => {
  // Extract the most useful information from the error
  const errorCode = error.code || error.name || 'UNKNOWN_ERROR';
  const errorMessage = error.message || defaultMessage;
  
  // Include stack trace in development but not in production
  const stackTrace = process.env.NODE_ENV === 'production' ? undefined : error.stack;
  
  // For SQL errors, provide more specific information
  const sqlErrorInfo = error.sqlMessage || error.sqlState || error.errno 
    ? {
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        errno: error.errno
      }
    : undefined;
  
  return {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      statusCode,
      details: error.details || undefined,
      sqlError: sqlErrorInfo,
      stack: stackTrace
    }
  };
};

/**
 * Send error response with appropriate status code
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error doesn't have one
 * @param {number} statusCode - HTTP status code
 */
const sendErrorResponse = (res, error, defaultMessage, statusCode = 500) => {
  console.error(`Error (${statusCode}):`, error.message);
  console.error('Stack:', error.stack);
  
  // If error has a specific HTTP status code defined, use it
  const finalStatusCode = error.statusCode || statusCode;
  
  // Format the error response
  const errorResponse = formatErrorResponse(error, defaultMessage, finalStatusCode);
  
  // Send the response
  res.status(finalStatusCode).json(errorResponse);
};

module.exports = {
  formatErrorResponse,
  sendErrorResponse
}; 