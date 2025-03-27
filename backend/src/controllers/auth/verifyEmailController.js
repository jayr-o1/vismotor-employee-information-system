const db = require("../../configs/db");

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("Received token:", token); // Debugging

  if (!token) {
    return res.status(400).json({ message: "Token is missing from the request!" });
  }

  try {
    const [result] = await db.promise().query(
      `SELECT * FROM Users WHERE verificationToken = ?`, [token]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid or already used token!" });
    }

    const user = result[0];
    if (new Date() > new Date(user.verificationTokenExpires)) {
      return res.status(400).json({ message: "Token has expired!" });
    }

    // Update the user to mark as verified
    await db.promise().query(
      `UPDATE Users SET isVerified = 1, verificationToken = NULL, verificationTokenExpires = NULL WHERE id = ?`,
      [user.id]
    );

    return res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};


module.exports = { verifyEmail };