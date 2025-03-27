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

    // Check if user is verified - isVerified is a bit field in MySQL
    const isVerified = user.isVerified ? (user.isVerified.readInt8(0) === 1) : false;
    if (!isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with the existing user fields
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = login;