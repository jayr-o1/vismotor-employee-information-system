const db = require("../database");
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

/**
 * Find user by email
 */
const findByEmail = async (email) => {
  try {
    const user = await db('users').where({ email }).first();
    return user || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Find user by ID
 */
const findById = async (id) => {
  try {
    // Select all fields except password for security
    const user = await db('users')
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'created_at', 'updated_at')
      .where({ id })
      .first();
      
    return user || null;
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
};

/**
 * Find user by verification token
 */
const findByVerificationToken = async (token) => {
  try {
    const user = await db('users').where({ verification_token: token }).first();
    return user || null;
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    throw error;
  }
};

/**
 * Find user by reset token
 */
const findByResetToken = async (token) => {
  try {
    const user = await db('users')
      .where({ reset_token: token })
      .whereRaw('reset_token_expiry > NOW()')
      .first();
    return user || null;
  } catch (error) {
    console.error('Error finding user by reset token:', error);
    throw error;
  }
};

/**
 * Get all users
 */
const findAll = async () => {
  try {
    // Check if users table exists
    const tableExists = await db.schema.hasTable('users');
    
    // If users table doesn't exist yet, return empty array
    if (!tableExists) {
      console.log("Users table does not exist yet - returning empty array");
      return [];
    }
    
    // Select all fields except password for security
    const users = await db('users')
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');
    
    return users;
  } catch (error) {
    console.error("Error in findAll:", error);
    throw error;
  }
};

/**
 * Create a new user
 */
const create = async (userData) => {
  const { first_name, last_name, username, email, password, role = 'user', is_verified = false } = userData;
  
  try {
    // Check if email already exists
    const existingUser = await db('users').where({ email }).first();
    
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token if needed
    const verificationToken = !is_verified ? generateRandomToken() : null;
    
    // Insert new user
    const [userId] = await db('users').insert({
      username,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      is_verified: is_verified ? 1 : 0,
      verification_token: verificationToken,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return { 
      id: userId,
      username,
      first_name,
      last_name,
      email,
      role,
      is_verified
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user
 */
const update = async (id, userData) => {
  const { name, email, role } = userData;
  
  const connection = await db.getConnection();
  try {
    // Check if email already exists for a different user
    const [existingEmails] = await connection.query(
      'SELECT * FROM users WHERE email = ? AND id != ?', 
      [email, id]
    );
    
    if (existingEmails.length > 0) {
      throw new Error('Email already in use by another user');
    }
    
    // Update user
    const [result] = await connection.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return { id, name, email, role };
  } finally {
    connection.release();
  }
};

/**
 * Update user password
 */
const updatePassword = async (id, password) => {
  const connection = await db.getConnection();
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password
    const [result] = await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};

/**
 * Delete a user
 */
const remove = async (id) => {
  const connection = await db.getConnection();
  try {
    // First get the user to check if they have a profile picture
    const [user] = await connection.query(
      'SELECT profile_picture FROM users WHERE id = ?',
      [id]
    );
    
    // Delete user
    const [result] = await connection.query(
      'DELETE FROM users WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      return false;
    }
    
    // If user had a profile picture, delete the file
    if (user.length > 0 && user[0].profile_picture) {
      const picturePath = path.join(__dirname, '../../../uploads/profile-pictures', user[0].profile_picture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }
    
    return true;
  } finally {
    connection.release();
  }
};

/**
 * Update user profile picture
 */
const updateProfilePicture = async (id, picturePath) => {
  const connection = await db.getConnection();
  try {
    // First check if user exists and if they already have a profile picture
    const [user] = await connection.query(
      'SELECT profile_picture FROM users WHERE id = ?', 
      [id]
    );
    
    if (user.length === 0) {
      return null;
    }
    
    // Delete old profile picture if it exists
    if (user[0].profile_picture) {
      const oldPicturePath = path.join(__dirname, '../../../uploads/profile-pictures', user[0].profile_picture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }
    
    // Update user with new profile picture
    const [result] = await connection.query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [picturePath, id]
    );
    
    return {
      id,
      profile_picture: picturePath
    };
  } finally {
    connection.release();
  }
};

/**
 * Helper function to generate a random token
 */
const generateRandomToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = {
  findByEmail,
  findById,
  findByVerificationToken,
  findByResetToken,
  findAll,
  create,
  update,
  updatePassword,
  remove,
  updateProfilePicture
}; 