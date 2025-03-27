const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../../../configs/database');

// Import controllers
const signup = require('../signupController');
const login = require('../loginController');
const { forgotPassword } = require('../forgotPasswordController');
const { resetPassword } = require('../resetPasswordController');
const { verifyEmail } = require('../verifyEmailController');

// Auth routes
router.post('/api/signup', signup);
router.post('/api/login', login);
router.post('/api/forgot-password', forgotPassword);
router.post('/api/reset-password', resetPassword);
router.get('/api/verify-email', verifyEmail);

// Route to check if a user exists (used for password reset)
router.post('/api/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    const connection = await mysql.createPool(dbConfig).getConnection();
    
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ exists: false });
    }
    
    res.json({ exists: true });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;