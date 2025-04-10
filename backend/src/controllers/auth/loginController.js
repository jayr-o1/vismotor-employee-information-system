const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const dbConfig = require('../../configs/database');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Create database connection
    const connection = await mysql.createPool(dbConfig).getConnection();

    // Find user by email
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is verified - handle different types that might be returned
    const isVerified = user.is_verified === 1 || 
                       user.is_verified === true || 
                       (user.is_verified && user.is_verified.readInt8 && user.is_verified.readInt8(0) === 1);
                     
    console.log('User verification status:', user.is_verified, 'Interpreted as:', isVerified);
    
    if (!isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
        userId: user.id,
        email: user.email
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = login;