const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dbConfig = require('../../configs/database');
const { generateToken } = require("../../utils/tokenUtils");
const { sendVerificationEmail } = require("../../services/emailService");

const signup = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Password validation - at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Create database connection
    const connection = await mysql.createPool(dbConfig).getConnection();

    // Check if email already exists
    const [existingEmails] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (existingEmails.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username already exists
    const [existingUsernames] = await connection.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );

    if (existingUsernames.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
    
    // Set token expiry (15 minutes from now)
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Insert user into database
    const [result] = await connection.query(
      'INSERT INTO users (firstName, lastName, username, email, password, isVerified, verificationToken, verificationTokenExpires, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [firstName, lastName, username, email, hashedPassword, 0, verificationToken, verificationTokenExpires]
    );

    connection.release();

    // TODO: Send verification email

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: result.insertId 
    });

  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = signup;