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
router.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const connection = await mysql.createPool(dbConfig).getConnection();
    
    // Find user by email
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.is_verified) {
      connection.release();
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const { generateToken } = require('../../../utils/tokenUtils');
    const verificationToken = generateToken();
    
    // Update user with new token
    await connection.query(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [verificationToken, user.id]
    );
    
    connection.release();
    
    // Send verification email
    const { sendVerificationEmail } = require('../../../services/emailService');
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
    
    try {
      await sendVerificationEmail(email, verificationLink);
      console.log(`Verification email resent to ${email}`);
      return res.status(200).json({ message: 'Verification email has been resent. Please check your inbox.' });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

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