/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  // Log the error for server-side debugging
  console.error(`${statusCode} - ${message}`, err.stack);
  
  // Create error response based on error type
  const errorResponse = {
    success: false,
    message: message,
    error: {
      code: err.code || "SERVER_ERROR"
    }
  };
  
  // Add error details if available and in development environment
  if (process.env.NODE_ENV !== 'production' && err.details) {
    errorResponse.error.details = err.details;
  }
  
  // Add validation errors if available
  if (err.validationErrors) {
    errorResponse.error.validationErrors = err.validationErrors;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  next(error);
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError
}; 