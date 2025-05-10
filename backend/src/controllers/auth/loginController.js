const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const db = require('../../configs/database');
const { sendErrorResponse } = require('../../utils/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';

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

module.exports = login;