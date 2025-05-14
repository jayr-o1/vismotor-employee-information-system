const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/auth.controller");

// Authentication routes
router.post("/api/login", authController.login);
router.post("/api/signup", authController.signup);
router.post("/api/forgot-password", authController.forgotPassword);
router.post("/api/reset-password", authController.resetPassword);
router.get("/api/verify-email", authController.verifyEmail);
router.post("/api/resend-verification", authController.resendVerification);

module.exports = router; 