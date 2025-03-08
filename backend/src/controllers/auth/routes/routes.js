// src/controllers/auth/routes/authRoutes.js
const express = require("express");
const { login } = require("../controllers/loginController");
const { signup } = require("../controllers/signupController");
const { verifyEmail } = require("../controllers/verifyEmailController");
const { forgotPassword } = require("../controllers/forgotPasswordController");
const { resetPassword } = require("../controllers/resetPasswordController");

const router = express.Router();

router.post("/api/login", login);
router.post("/api/signup", signup);
router.get("/api/verify-email", verifyEmail);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/reset-password", resetPassword);

module.exports = router;