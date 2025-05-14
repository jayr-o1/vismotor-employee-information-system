const userModel = require('../../models/user.model');
const { AppError } = require('../../middleware/error.middleware');
const path = require('path');
const fs = require('fs');

/**
 * Controller for user operations
 * Implementing actual business logic using model functions
 */

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json({
      success: true,
      message: "Successfully retrieved all users",
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    
    if (!user) {
      return next(new AppError(`User with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Successfully retrieved user",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Create user
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, is_verified } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required', 400));
    }
    
    try {
      const newUser = await userModel.create({
        name,
        email,
        password,
        role,
        is_verified
      });
      
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser
      });
    } catch (error) {
      if (error.message === 'Email already exists') {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return next(new AppError('Name and email are required', 400));
    }
    
    try {
      const updatedUser = await userModel.update(id, {
        name,
        email,
        role
      });
      
      if (!updatedUser) {
        return next(new AppError(`User with ID ${id} not found`, 404));
      }
      
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
      });
    } catch (error) {
      if (error.message === 'Email already in use by another user') {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Update user password
const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, currentPassword } = req.body;
    
    if (!password) {
      return next(new AppError('New password is required', 400));
    }
    
    // TODO: Implement current password verification when needed
    
    const success = await userModel.updatePassword(id, password);
    
    if (!success) {
      return next(new AppError(`User with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await userModel.remove(id);
    
    if (!success) {
      return next(new AppError(`User with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return next(new AppError('No profile picture uploaded', 400));
    }
    
    const profilePicturePath = req.file.filename;
    const result = await userModel.updateProfilePicture(id, profilePicturePath);
    
    if (!result) {
      return next(new AppError(`User with ID ${id} not found`, 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get profile picture
const getProfilePicture = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../../../uploads/profile-pictures', filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return next(new AppError('Profile picture not found', 404));
    }
    
    // Send the file
    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  uploadProfilePicture,
  getProfilePicture
}; 