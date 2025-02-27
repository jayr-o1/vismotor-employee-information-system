const bcrypt = require("bcryptjs");
const { createUser, findUserByUsername } = require("../models/userModel");
const sendEmail = require("../utils/email");
const generateCode = require("../utils/generateCode");

const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification code
    const verificationCode = generateCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create the user
    await createUser(
      username,
      hashedPassword,
      email,
      verificationCode,
      verificationCodeExpires
    );

    // Send the verification code via email
    await sendEmail(
      email,
      "Verify Your Account",
      `Your verification code is: ${verificationCode}`
    );

    res.status(201).json({
      message: "User registered. Check your email for the verification code.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyUser = async (req, res) => {
  const { username, verificationCode } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user || user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Mark the user as verified
    await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("UPDATE Users SET isVerified = 1 WHERE username = @username");

    res.json({ message: "User verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate a password reset code
    const passwordResetCode = generateCode();
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save the code and expiration time in the database
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("passwordResetCode", sql.VarChar, passwordResetCode)
      .input("passwordResetExpires", sql.DateTime, passwordResetExpires)
      .query(
        "UPDATE Users SET passwordResetCode = @passwordResetCode, passwordResetExpires = @passwordResetExpires WHERE email = @email"
      );

    // Send the password reset code via email
    await sendEmail(
      email,
      "Password Reset",
      `Your password reset code is: ${passwordResetCode}`
    );

    res.json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
    const { email, passwordResetCode, newPassword } = req.body;
  
    try {
      const user = await findUserByEmail(email);
  
      if (!user || user.passwordResetCode !== passwordResetCode) {
        return res.status(400).json({ message: 'Invalid password reset code' });
      }
  
      if (new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: 'Password reset code has expired' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password and clear the reset code
      await pool.request()
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, hashedPassword)
        .query('UPDATE Users SET password = @password, passwordResetCode = NULL, passwordResetExpires = NULL WHERE email = @email');
  
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

module.exports = { registerUser };
module.exports = { registerUser, verifyUser };
module.exports = { registerUser, verifyUser, forgotPassword };
module.exports = { registerUser, verifyUser, forgotPassword, resetPassword };
