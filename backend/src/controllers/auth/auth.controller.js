/**
 * Auth controller for authentication operations
 * Combines functionality from all auth-related controllers
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database');
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

    try {
      // Debug: Log all users for debugging
      const allUsers = await db('users').select('id', 'username as name', 'email', 'role', 'is_verified');
      console.log('All users in the database:');
      allUsers.forEach(u => console.log(`User: ${u.id}, ${u.name}, ${u.email}, ${u.role}, verified: ${u.is_verified}`));
      
      // Find user by email
      console.log(`Looking for user with email: "${email}"`);
      const user = await db('users').where({ email }).first();

      console.log(`Found user: ${user ? 'Yes' : 'No'}`);

      if (!user) {
        const authError = new Error('Invalid credentials');
        authError.code = 'AUTHENTICATION_FAILED';
        authError.statusCode = 401;
        throw authError;
      }

      console.log(`Found user: ID=${user.id}, Name=${user.first_name} ${user.last_name}, Email=${user.email}, Role=${user.role}`);

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

      // Construct full name
      const name = `${user.first_name} ${user.last_name}`;

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          name: name,
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
          name: name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error in login database operations:', error);
      throw error;
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

    try {
      // Check if email already exists
      const existingUser = await db('users').where({ email }).first();

      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = generateToken();
      
      // Set token expiry (15 minutes from now)
      const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

      // Create username from first name and last name
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

      // Insert user into database
      const [userId] = await db('users').insert({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        role: 'user',
        is_verified: 0,
        verification_token: verificationToken,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken, `${firstName} ${lastName}`);

      // Return success response without exposing sensitive data
      return res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: userId,
          name: `${firstName} ${lastName}`,
          email
        }
      });
    } catch (error) {
      console.error('Database error during signup:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify user email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    try {
      // Find user with verification token
      const user = await db('users').where({ verification_token: token }).first();

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Update user as verified
      await db('users')
        .where({ id: user.id })
        .update({ 
          is_verified: 1, 
          verification_token: null,
          updated_at: new Date()
        });

      return res.status(200).json({
        message: 'Email verification successful. You can now log in.',
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Database error during email verification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    return res.status(500).json({ message: 'Server error during email verification' });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      // Find user by email
      const user = await db('users').where({ email }).first();

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      if (user.is_verified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = generateToken();

      // Update user with new verification token
      await db('users')
        .where({ id: user.id })
        .update({ 
          verification_token: verificationToken,
          updated_at: new Date()
        });

      // Send verification email
      await sendVerificationEmail(email, verificationToken, `${user.first_name} ${user.last_name}`);

      return res.status(200).json({
        message: 'Verification email sent. Please check your inbox.'
      });
    } catch (error) {
      console.error('Database error during resend verification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in resendVerification:', error);
    return res.status(500).json({ message: 'Server error during resend verification' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      // Find user by email
      const user = await db('users').where({ email }).first();

      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
      }

      // Generate reset token
      const resetToken = generateToken();
      
      // Set token expiry (1 hour from now)
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // Update user with reset token
      await db('users')
        .where({ id: user.id })
        .update({ 
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry,
          updated_at: new Date()
        });

      // TODO: Send password reset email

      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      console.error('Database error during forgot password:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
      // Find user with reset token
      const user = await db('users')
        .where({ reset_token: token })
        .whereRaw('reset_token_expiry > NOW()')
        .first();

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user with new password
      await db('users')
        .where({ id: user.id })
        .update({ 
          password: hashedPassword,
          reset_token: null,
          reset_token_expiry: null,
          updated_at: new Date()
        });

      return res.status(200).json({
        message: 'Password reset successful. You can now log in with your new password.'
      });
    } catch (error) {
      console.error('Database error during password reset:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Export controllers
module.exports = {
  login,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification
}; 