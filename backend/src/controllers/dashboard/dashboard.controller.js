const dashboardModel = require('../../models/dashboard.model');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Controller for dashboard operations
 * Implementing actual business logic using model functions
 */

// Get dashboard stats
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardModel.getStats();
    
    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      ...stats
    });
  } catch (error) {
    next(error);
  }
};

// Get applicant trends
const getApplicantTrends = async (req, res, next) => {
  try {
    const trends = await dashboardModel.getApplicantTrends();
    
    res.status(200).json({
      success: true,
      message: "Applicant trends retrieved successfully",
      ...trends
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getApplicantTrends
}; 