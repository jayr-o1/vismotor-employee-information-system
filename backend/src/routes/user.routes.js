const express = require("express");
const router = express.Router();
const userController = require("../controllers/user/user.controller");
const uploadMiddleware = require("../middleware/upload.middleware");
const { isAdmin } = require("../middleware/auth.middleware");

// Get all users
router.get("/api/users", userController.getAllUsers);

// Get user by ID
router.get("/api/users/:id", userController.getUserById);

// Create user
router.post("/api/users", userController.createUser);

// Update user
router.put("/api/users/:id", userController.updateUser);

// Update user password
router.patch("/api/users/:id/password", userController.updatePassword);

// Delete user
router.delete("/api/users/:id", userController.deleteUser);

// Upload profile picture
router.post(
  "/api/users/:id/profile-picture",
  uploadMiddleware.uploadProfilePicture,
  userController.uploadProfilePicture
);

// Get profile picture
router.get("/api/profile-pictures/:filename", userController.getProfilePicture);

module.exports = router; 