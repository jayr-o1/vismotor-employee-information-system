const db = require("../../configs/db");
const bcrypt = require("bcryptjs");

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

module.exports = { resetPassword };