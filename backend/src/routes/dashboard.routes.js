const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard/dashboard.controller");

// Get dashboard stats
router.get("/api/dashboard", dashboardController.getStats);

// Get applicant trends
router.get("/api/dashboard/applicant-trends", dashboardController.getApplicantTrends);

module.exports = router; 