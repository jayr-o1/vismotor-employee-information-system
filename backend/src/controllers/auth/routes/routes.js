const express = require("express");
const { login } = require("../loginController");
const { signup } = require("../signupController");
const { verifyEmail } = require("../verifyEmailController");
const { forgotPassword } = require("../forgotPasswordController");
const { resetPassword, showResetPasswordForm } = require("../resetPasswordController");

const router = express.Router();

router.post("/api/login", login);
router.post("/api/signup", signup);
router.get("/api/verify-email", verifyEmail);
router.post("/api/forgot-password", forgotPassword);
router.get("/api/reset-password", showResetPasswordForm); // Add this line
router.post("/api/reset-password", resetPassword);

module.exports = router;