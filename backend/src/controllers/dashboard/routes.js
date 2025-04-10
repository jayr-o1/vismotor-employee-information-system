const express = require('express');
const router = express.Router();
const { getStats, getApplicantTrends } = require('./dashboardController');
const { validateToken, ensureVerified } = require('../../utils/authMiddleware');

// Apply authentication and verification middleware to all dashboard routes
router.use(validateToken);
router.use(ensureVerified);

// Dashboard routes
router.get('/', getStats);
router.get('/applicant-trends', getApplicantTrends);

module.exports = router; 