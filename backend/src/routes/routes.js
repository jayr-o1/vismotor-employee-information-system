// src/routes/routes.js
const express = require("express");
const { login, signup, verifyEmail, forgotPassword, resetPassword } = require("../controllers/userController");

const router = express.Router();

router.post("/api/login", login);
router.post("/api/signup", signup);
router.get("/api/verify-email", verifyEmail);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/reset-password", resetPassword);

module.exports = router;