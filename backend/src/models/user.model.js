const db = require("../config/database");
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

/**
 * Find user by email
 */
const findByEmail = async (email) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

/**
 * Find user by ID
 */
const findById = async (id) => {
  const connection = await db.getConnection();
  try {
    // Select all fields except password for security
    const [rows] = await connection.query(`
      SELECT id, name, email, role, is_verified, profile_picture, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Convert bit field to boolean if needed
    return {
      ...rows[0],
      is_verified: rows[0].is_verified === 1 || 
                  rows[0].is_verified === true || 
                  (rows[0].is_verified && rows[0].is_verified.readInt8 && rows[0].is_verified.readInt8(0) === 1)
    };
  } finally {
    connection.release();
  }
};

/**
 * Find user by verification token
 */
const findByVerificationToken = async (token) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query("SELECT * FROM users WHERE verification_token = ?", [token]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

/**
 * Find user by reset token
 */
const findByResetToken = async (token) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
};

/**
 * Get all users
 */
const findAll = async () => {
  const connection = await db.getConnection();
  try {
    // Check if users table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
    `);
    
    // If users table doesn't exist yet, return empty array
    if (tables.length === 0) {
      console.log("Users table does not exist yet - returning empty array");
      return [];
    }
    
    // Select all fields except password for security
    const [rows] = await connection.query(`
      SELECT id, name, email, role, is_verified, profile_picture, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    // Convert bit field to boolean if needed
    return rows.map(user => ({
      ...user,
      is_verified: user.is_verified === 1 || 
                  user.is_verified === true || 
                  (user.is_verified && user.is_verified.readInt8 && user.is_verified.readInt8(0) === 1)
    }));
  } catch (error) {
    console.error("Error in findAll:", error);
    
    // Try fallback query if the original one fails
    try {
      const [basicRows] = await connection.query(`
        SELECT id, name, email, role
        FROM users
      `);
      
      console.log("Retrieved basic user data with fallback query");
      return basicRows;
    } catch (fallbackError) {
      console.error("Fallback query error:", fallbackError);
      throw fallbackError;
    }
  } finally {
    connection.release();
  }
};

/**
 * Create a new user
 */
const create = async (userData) => {
  const { name, email, password, role = 'hr_staff', is_verified = false } = userData;
  
  const connection = await db.getConnection();
  try {
    // Check if email already exists
    const [existingEmails] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingEmails.length > 0) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token if needed
    const verificationToken = !is_verified ? generateRandomToken() : null;
    
    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, is_verified ? 1 : 0, verificationToken]
    );
    
    return { 
      id: result.insertId,
      name,
      email,
      role,
      is_verified
    };
  } finally {
    connection.release();
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
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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