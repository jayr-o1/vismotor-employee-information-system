const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dbConfig = require('../configs/database');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to ensure user is verified
const ensureVerified = async (req, res, next) => {
  try {
    // User data is added to request by validateToken middleware
    const userId = req.user.userId;
    
    // Connect to database
    const connection = await mysql.createPool(dbConfig).getConnection();
    
    // Check if user exists and is verified
    const [users] = await connection.query(
      'SELECT is_verified FROM users WHERE id = ?',
      [userId]
    );
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const user = users[0];
    const isVerified = user.is_verified === 1 || 
                       user.is_verified === true || 
                       (user.is_verified && user.is_verified.readInt8 && user.is_verified.readInt8(0) === 1);
    
    if (!isVerified) {
      return res.status(403).json({ 
        message: 'Email verification required. Please verify your email to access this resource.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    res.status(500).json({ message: 'Server error during verification check.' });
  }
};

// Combined middleware for routes that require both authentication and verified email
const protected = [validateToken, ensureVerified];

module.exports = {
  validateToken,
  ensureVerified,
  protected
}; 