// src/controllers/auth/routes/authRoutes.js
const express = require("express");
const { login } = require("../loginController");
const { signup } = require("../signupController");
const { verifyEmail } = require("../verifyEmailController");
const { forgotPassword } = require("../forgotPasswordController");
const { resetPassword } = require("../resetPasswordController");

const router = express.Router();

router.post("/api/login", login);
router.post("/api/signup", signup);
router.get("/api/verify-email", verifyEmail);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/reset-password", resetPassword);

module.exports = router;