const db = require("../../configs/database");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Log the reset attempt
  console.log(`Processing password reset with token: ${token && token.substring(0, 6)}...`);

  // Validate inputs
  if (!token || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: "Token and new password are required!" 
    });
  }

  // Validate password length
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long."
    });
  }

  try {
    // Get a connection from the pool
    const connection = await db.getConnection();

    try {
      // Check if the token is valid
      const [result] = await connection.query(`SELECT * FROM users WHERE reset_token = ?`, [token]);

      if (result.length === 0) {
        connection.release();
        console.log('Reset password error: Invalid or expired token');
        return res.status(400).json({ 
          success: false,
          message: "Invalid or expired token. Please request a new password reset link."
        });
      }

      const user = result[0];
      console.log(`Found user for reset: ID=${user.id}, Email=${user.email}`);

      // Check if the token has expired
      if (new Date() > new Date(user.reset_token_expiry)) {
        connection.release();
        console.log('Reset password error: Token expired');
        return res.status(400).json({ 
          success: false,
          message: "Token expired. Please request a new password reset link."
        });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the user's password and clear the reset token
      await connection.query(
        `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
        [hashedPassword, user.id]
      );

      connection.release();
      console.log(`Password reset successful for user ID=${user.id}`);
      
      // Send a success response
      res.json({ 
        success: true,
        message: "Password reset successfully! You can now log in with your new password."
      });
    } catch (error) {
      if (connection) connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      success: false,
      message: "An unexpected error occurred. Please try again later."
    });
  }
};

const showResetPasswordForm = async (req, res) => {
  const { token } = req.query;

  // Validate token
  if (!token) {
    return res.status(400).json({ 
      success: false,
      message: "Token is required!" 
    });
  }

  try {
    // Get a connection from the pool
    const connection = await db.getConnection();

    try {
      // Check if the token is valid
      const [result] = await connection.query(`SELECT * FROM users WHERE reset_token = ?`, [token]);

      if (result.length === 0) {
        connection.release();
        return res.status(400).json({ 
          success: false,
          message: "Invalid token! Please request a new password reset." 
        });
      }

      const user = result[0];

      // Check if the token has expired
      if (new Date() > new Date(user.reset_token_expiry)) {
        connection.release();
        return res.status(400).json({ 
          success: false,
          message: "Token expired! Please request a new password reset." 
        });
      }

      connection.release();
      
      // Redirect to the frontend reset password page with the token
      res.redirect(`http://10.10.1.71:5173/reset-password?token=${token}`);
    } catch (error) {
      if (connection) connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Reset Password Form Error:", error);
    res.status(500).json({ 
      success: false,
      message: "An unexpected error occurred. Please try again later."
    });
  }
};

module.exports = { resetPassword, showResetPasswordForm };