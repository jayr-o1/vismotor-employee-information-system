const db = require("../../configs/db");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Validate inputs
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required!" });
  }

  try {
    // Check if the token is valid
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE resetToken = ?`, [token]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result[0];

    // Check if the token has expired
    if (new Date() > new Date(user.resetTokenExpires)) {
      return res.status(400).json({ message: "Token expired!" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear the reset token
    await db.promise().query(
      `UPDATE Users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE resetToken = ?`,
      [hashedPassword, token]
    );

    // Send a success response
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const showResetPasswordForm = async (req, res) => {
  const { token } = req.query;

  // Validate token
  if (!token) {
    return res.status(400).json({ message: "Token is required!" });
  }

  try {
    // Check if the token is valid
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE resetToken = ?`, [token]);

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result[0];

    // Check if the token has expired
    if (new Date() > new Date(user.resetTokenExpires)) {
      return res.status(400).json({ message: "Token expired!" });
    }

    // Redirect to the frontend reset password page with the token
    res.redirect(`http://localhost:5173/reset-password?token=${token}`);
  } catch (error) {
    console.error("Reset Password Form Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { resetPassword, showResetPasswordForm };