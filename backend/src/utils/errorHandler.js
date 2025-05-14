/**
 * Helper functions for error handling
 */

/**
 * Send a standardized error response to the client
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - Error message to send to client
 * @param {number} statusCode - HTTP status code
 */
const sendErrorResponse = (res, error, message, statusCode = 500) => {
  console.error(`Error: ${message}`, error);
  
  // Create response object
  const errorResponse = {
    success: false,
    message: message || error.message || 'An error occurred',
    error: {
      code: error.code || 'SERVER_ERROR'
    }
  };
  
  // Add error details if available
  if (error.details) {
    errorResponse.error.details = error.details;
  }
  
  // Send response
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  sendErrorResponse
}; 