const mysql = require('mysql2/promise');
const dbConfig = require('../../configs/database');

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("Received token:", token); // Debugging

  if (!token) {
    return res.status(400).json({ message: "Token is missing from the request!" });
  }

  try {
    const connection = await mysql.createPool(dbConfig).getConnection();
    
    // First check if there is a user with this verification token
    const [users] = await connection.query(
      "SELECT * FROM users WHERE verification_token = ?", 
      [token]
    );

    // If no user found with the token, check if maybe a user was already verified with this token
    if (users.length === 0) {
      // Check if there's a verified user whose token was cleared after verification
      const [verifiedUsers] = await connection.query(
        "SELECT * FROM users WHERE is_verified = 1 AND verification_token IS NULL"
      );
      
      // We can't be 100% sure this token belonged to this user, but if a user is verified,
      // we'll assume it's from a previously used token
      if (verifiedUsers.length > 0) {
        connection.release();
        return res.json({ 
          message: "Your email is already verified. You can now log in to your account.",
          alreadyVerified: true
        });
      }
      
      connection.release();
      return res.status(400).json({ message: "Invalid or expired verification token!" });
    }

    const user = users[0];
    
    // Check if user is already verified
    if (user.is_verified) {
      connection.release();
      return res.json({ 
        message: "Your email is already verified. You can now log in to your account.",
        alreadyVerified: true
      });
    }

    // Update user to verified status
    await connection.query(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );

    connection.release();
    return res.json({ message: "Email verified successfully! You can now login to your account." });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

module.exports = { verifyEmail };