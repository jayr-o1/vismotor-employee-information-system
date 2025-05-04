const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const db = require('../../configs/database');

// Get all users
router.get('/api/users', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Select all fields except password for security
    const [rows] = await connection.query(`
      SELECT id, firstName, lastName, username, email, createdAt, isVerified
      FROM users 
      ORDER BY createdAt DESC
    `);
    
    connection.release();
    
    // Convert bit field to boolean
    const users = rows.map(user => ({
      ...user,
      isVerified: user.isVerified ? (user.isVerified.readInt8(0) === 1) : false
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    // Select all fields except password for security
    const [rows] = await connection.query(`
      SELECT id, firstName, lastName, username, email, createdAt, isVerified
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

module.exports = router; 