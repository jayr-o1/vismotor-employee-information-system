const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const db = require('../../configs/database');
const { sendErrorResponse } = require('../../utils/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
      // Find user by email
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        const authError = new Error('Invalid credentials');
        authError.code = 'AUTHENTICATION_FAILED';
        authError.statusCode = 401;
        throw authError;
      }

      const user = users[0];

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
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
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

module.exports = login;