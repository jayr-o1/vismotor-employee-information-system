// userController.js
const db = require("../configs/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenUtils");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../services/emailService");

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required!" });
  }

  try {
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE email = ?`, [email]);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result[0];
    const isVerified = user.isVerified instanceof Buffer ? user.isVerified.readUInt8(0) : user.isVerified;

    if (isVerified !== 1) {
      return res.status(400).json({ message: "Email not verified! Please check your email for the verification link." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Signup
const signup = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ message: "Username must be between 3 and 20 characters and contain only letters, numbers, and underscores!" });
  }

  try {
    const [existingEmail] = await db.promise().query(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    const [existingUsername] = await db.promise().query(`SELECT * FROM Users WHERE username = ?`, [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ message: "Username is already taken!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateToken();
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.promise().query(
      `INSERT INTO Users (firstName, lastName, username, email, password, isVerified, verificationToken, verificationTokenExpires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, username, email, hashedPassword, 0, verificationToken, verificationTokenExpires]
    );

    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);

    res.status(201).json({ message: "Signup successful! Please check your email to verify your account." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required!" });
  }

  try {
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE verificationToken = ?`, [token]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result[0];
    if (new Date() > new Date(user.verificationTokenExpires)) {
      return res.status(400).json({ message: "Token expired!" });
    }

    await db.promise().query(
      `UPDATE Users SET isVerified = 1, verificationToken = NULL, verificationTokenExpires = NULL WHERE verificationToken = ?`,
      [token]
    );

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  try {
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE email = ?`, [email]);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result[0];
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.promise().query(
      `UPDATE Users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?`,
      [resetToken, resetTokenExpires, email]
    );

    const resetLink = `http://localhost:5000/api/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required!" });
  }

  try {
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE resetToken = ?`, [token]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result[0];
    if (new Date() > user.resetTokenExpires) {
      return res.status(400).json({ message: "Token expired!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.promise().query(
      `UPDATE Users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE resetToken = ?`,
      [hashedPassword, token]
    );

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { login, signup, verifyEmail, forgotPassword, resetPassword };