const db = require("../../configs/db");
const { generateToken } = require("../../utils/tokenUtils");
const { sendResetPasswordEmail } = require("../../services/emailService");

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

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { forgotPassword };