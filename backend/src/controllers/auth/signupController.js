const bcrypt = require('bcryptjs');
const db = require('../../configs/database');
const mysql = require('mysql2/promise');
const { generateToken } = require("../../utils/tokenUtils");
const { sendVerificationEmail } = require("../../services/emailService");

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
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
    const connection = await db.getConnection();

    // Check if email already exists
    const [existingEmails] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (existingEmails.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateToken();
    
    // Set token expiry (15 minutes from now)
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Insert user into database using the correct column names
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', 0, verificationToken]
    );

    connection.release();

    // Send verification email
    const verificationLink = `http://10.10.1.71:5173/verify-email?token=${verificationToken}`;
    
    try {
      await sendVerificationEmail(email, verificationLink);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't return an error to the client, just log it
    }

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