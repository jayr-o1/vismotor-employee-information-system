const db = require("../../configs/db");

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

module.exports = { verifyEmail };