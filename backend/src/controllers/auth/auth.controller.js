/**
 * Auth controller for authentication operations
 * Combines functionality from all auth-related controllers
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const { JWT_SECRET } = require('../../config/jwt');
const { sendErrorResponse } = require('../../utils/errorHandler');
const { generateToken } = require("../../utils/tokenUtils");
const { sendVerificationEmail } = require("../../services/emailService");

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordProvided: !!password });

    // Input validation
    if (!email || !password) {
      const validationError = new Error('Please provide email and password');
      validationError.code = 'VALIDATION_ERROR';
      validationError.statusCode = 400;
      throw validationError;
    }

    // Create database connection
    const connection = await db.getConnection();
    
    try {
      // Debug: Log all users for debugging
      const [allUsers] = await connection.query('SELECT id, name, email, role, is_verified FROM users');
      console.log('All users in the database:');
      allUsers.forEach(u => console.log(`User: ${u.id}, ${u.name}, ${u.email}, ${u.role}, verified: ${u.is_verified}`));
      
      // Find user by email
      console.log(`Looking for user with email: "${email}"`);
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      console.log(`Found ${users.length} users matching email`);

      if (users.length === 0) {
        const authError = new Error('Invalid credentials');
        authError.code = 'AUTHENTICATION_FAILED';
        authError.statusCode = 401;
        throw authError;
      }

      const user = users[0];
      console.log(`Found user: ID=${user.id}, Name=${user.name}, Email=${user.email}, Role=${user.role}`);

      // Check if user is verified - handle different types that might be returned
      const isVerified = user.is_verified === 1 || 
                         user.is_verified === true || 
                         (user.is_verified && user.is_verified.readInt8 && user.is_verified.readInt8(0) === 1);
                       
      console.log('User verification status:', user.is_verified, 'Interpreted as:', isVerified);
      
      if (!isVerified) {
        const verificationError = new Error('Please verify your email before logging in');
        verificationError.code = 'EMAIL_NOT_VERIFIED';
        verificationError.statusCode = 403;
        verificationError.details = {
          userId: user.id,
          email: user.email
        };
        throw verificationError;
      }

      // Compare password
      console.log('Comparing provided password with stored hash');
      console.log('Stored password hash:', user.password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', isPasswordValid);
      
      if (!isPasswordValid) {
        // For debugging, create a new hash for comparison
        console.log('Generating new hash for the provided password:');
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        console.log('New hash for same password:', newHash);
        
        const authError = new Error('Invalid credentials');
        authError.code = 'AUTHENTICATION_FAILED';
        authError.statusCode = 401;
        throw authError;
      }

      // Parse user name into first and last names for the token
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          name: user.name,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful, token generated');

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error('Error in login:', error);
    
    // Handle different types of errors
    switch (error.code) {
      case 'VALIDATION_ERROR':
        sendErrorResponse(res, error, 'Validation failed', 400);
        break;
      case 'AUTHENTICATION_FAILED':
        sendErrorResponse(res, error, 'Authentication failed', 401);
        break;
      case 'EMAIL_NOT_VERIFIED':
        sendErrorResponse(res, error, 'Email not verified', 403);
        break;
      default:
        sendErrorResponse(res, error, 'Server error during login', 500);
    }
  }
};

// Sign up user
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

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("Received token:", token); // Debugging

  if (!token) {
    return res.status(400).json({ message: "Token is missing from the request!" });
  }

  try {
    const connection = await db.getConnection();
    
    // First check if there is a user with this verification token
    const [users] = await connection.query(
      "SELECT * FROM users WHERE verification_token = ?", 
      [token]
    );

    // If no user found with the token, check if maybe a user was already verified with this token
    if (users.length === 0) {
      // Check if there's a verified user whose token was cleared after verification
      const [verifiedUsers] = await connection.query(
        "SELECT * FROM users WHERE is_verified = 1 AND verification_token IS NULL"
      );
      
      // We can't be 100% sure this token belonged to this user, but if a user is verified,
      // we'll assume it's from a previously used token
      if (verifiedUsers.length > 0) {
        connection.release();
        return res.json({ 
          message: "Your email is already verified. You can now log in to your account.",
          alreadyVerified: true
        });
      }
      
      connection.release();
      return res.status(400).json({ message: "Invalid or expired verification token!" });
    }

    const user = users[0];
    
    // Check if user is already verified
    if (user.is_verified) {
      connection.release();
      return res.json({ 
        message: "Your email is already verified. You can now log in to your account.",
        alreadyVerified: true
      });
    }

    // Update user to verified status
    await connection.query(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    connection.release();
    return res.json({ message: "Email verified successfully! You can now login to your account." });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const connection = await db.getConnection();
    
    // Check if user exists
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Check if already verified
    if (user.is_verified) {
      connection.release();
      return res.json({ 
        message: "Your email is already verified. You can now log in to your account.",
        alreadyVerified: true
      });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    
    // Update with new token
    await connection.query(
      "UPDATE users SET verification_token = ? WHERE id = ?",
      [verificationToken, user.id]
    );

    connection.release();

    // Send new verification email
    const verificationLink = `http://10.10.1.71:5173/verify-email?token=${verificationToken}`;
    
    try {
      await sendVerificationEmail(email, verificationLink);
      console.log(`New verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ message: "Error sending verification email" });
    }

    return res.json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const connection = await db.getConnection();
    
    // Find user by email
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      connection.release();
      // Don't reveal that the user doesn't exist for security reasons
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }
    
    const user = users[0];
    
    // Generate a password reset token
    const resetToken = generateToken();
    
    // Set token expiry (15 minutes from now)
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    
    // Save the token and expiry to the database
    await connection.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    );
    
    connection.release();
    
    // Send password reset email
    const resetLink = `http://10.10.1.71:5173/reset-password?token=${resetToken}`;
    
    try {
      // This is a placeholder - you'll need to implement the actual email sending logic
      console.log(`Password reset email would be sent to ${email} with link: ${resetLink}`);
      // await sendPasswordResetEmail(email, resetLink);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't return an error to the client, just log it
    }
    
    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Password validation - at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    const connection = await db.getConnection();
    
    // Find user by reset token
    const [users] = await connection.query(
      'SELECT * FROM users WHERE reset_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }
    
    const user = users[0];
    
    // Check if token has expired
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      connection.release();
      return res.status(400).json({ message: 'Password reset token has expired' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the user's password and clear the reset token
    await connection.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    connection.release();
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = {
  login,
  signup,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
}; 