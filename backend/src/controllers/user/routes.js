const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const db = require('../../configs/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up multer with file size and type validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profilePicture');

// Get all users
router.get('/api/users', async (req, res) => {
  try {
    console.log("Fetching users from database");
    const connection = await db.getConnection();
    
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
      connection.release();
      return res.json([]);
    }
    
    // Get column information from the users table
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    console.log("Users table columns:", columns.map(c => c.Field));
    
    try {
      // Select all fields except password for security
      const [rows] = await connection.query(`
        SELECT id, name, email, role, is_verified, profile_picture, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `);
      
      connection.release();
      
      // Convert bit field to boolean if needed
      const users = rows.map(user => ({
        ...user,
        is_verified: user.is_verified === 1 || user.is_verified === true || 
                    (user.is_verified && user.is_verified.readInt8 && user.is_verified.readInt8(0) === 1)
      }));
      
      res.json(users);
    } catch (queryError) {
      console.error("SQL query error:", queryError);
      
      // Fallback to querying just id, name, email and role if the previous query failed
      try {
        const [basicRows] = await connection.query(`
          SELECT id, name, email, role
          FROM users
        `);
        
        connection.release();
        console.log("Retrieved basic user data with fallback query");
        
        res.json(basicRows);
      } catch (fallbackError) {
        console.error("Fallback query error:", fallbackError);
        connection.release();
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get user by ID
router.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Select all fields except password for security
    const [rows] = await connection.query(`
      SELECT id, firstName, lastName, username, email, profile_picture, createdAt, isVerified
      FROM users 
      WHERE id = ?
    `, [id]);
    
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert bit field to boolean
    const user = {
      ...rows[0],
      isVerified: rows[0].isVerified ? (rows[0].isVerified.readInt8(0) === 1) : false
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, isVerified = false } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, username, email, and password are required' });
    }
    
    const connection = await db.getConnection();
    
    // Check if email already exists
    const [existingEmails] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingEmails.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check if username already exists
    const [existingUsernames] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUsernames.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (firstName, lastName, username, email, password, isVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [firstName, lastName, username, email, hashedPassword, isVerified ? 1 : 0]
    );
    
    connection.release();
    
    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update a user
router.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, username, email, isVerified } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ message: 'First name, last name, username, and email are required' });
    }
    
    const connection = await db.getConnection();
    
    // Check if email already exists for a different user
    const [existingEmails] = await connection.query(
      'SELECT * FROM users WHERE email = ? AND id != ?', 
      [email, id]
    );
    
    if (existingEmails.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already in use by another user' });
    }
    
    // Check if username already exists for a different user
    const [existingUsernames] = await connection.query(
      'SELECT * FROM users WHERE username = ? AND id != ?', 
      [username, id]
    );
    
    if (existingUsernames.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Username already taken by another user' });
    }
    
    // Update user
    const [result] = await connection.query(
      'UPDATE users SET firstName = ?, lastName = ?, username = ?, email = ?, isVerified = ? WHERE id = ?',
      [firstName, lastName, username, email, isVerified ? 1 : 0, id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Update user password
router.patch('/api/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    // Validate required fields
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    const connection = await db.getConnection();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password
    const [result] = await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Delete a user
router.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Delete user
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Upload user profile picture
router.post('/api/users/:id/profile-picture', (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file too large)
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // Some other error occurred
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
    
    // If file upload was successful
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
      const { id } = req.params;
      const profilePicturePath = req.file.filename;
      
      const connection = await db.getConnection();
      
      // First check if user exists and if they already have a profile picture
      const [user] = await connection.query('SELECT profile_picture FROM users WHERE id = ?', [id]);
      
      if (user.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete old profile picture if it exists
      if (user[0].profile_picture) {
        const oldPicturePath = path.join(__dirname, '../../../uploads/profile-pictures', user[0].profile_picture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      // Update user with new profile picture
      await connection.query(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePicturePath, id]
      );
      
      connection.release();
      
      res.status(200).json({ 
        message: 'Profile picture uploaded successfully',
        profile_picture: profilePicturePath
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Failed to update profile picture' });
    }
  });
});

// Get profile picture
router.get('/api/profile-pictures/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../../../uploads/profile-pictures', filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'Profile picture not found' });
  }
  
  // Send the file
  res.sendFile(filepath);
});

module.exports = router; 