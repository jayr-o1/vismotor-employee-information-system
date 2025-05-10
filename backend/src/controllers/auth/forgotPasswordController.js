const db = require("../../configs/database");
const { generateToken } = require("../../utils/tokenUtils");
const { sendResetPasswordEmail } = require("../../services/emailService");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: "Email is required!" 
    });
  }

  // Enhanced debugging for email handling
  console.log(`🔍 Processing password reset request for email: "${email}"`);
  console.log(`📧 Email type: ${typeof email}, length: ${email.length}`);
  
  // Log if there are any hidden characters or whitespace
  const emailTrimmed = email.trim();
  if (email !== emailTrimmed) {
    console.log(`⚠️ Warning: Email contains leading/trailing whitespace. Original: "${email}", Trimmed: "${emailTrimmed}"`);
  }

  try {
    // Get a connection from the pool
    const connection = await db.getConnection();
    
    try {
      // List all users for debugging
      const [allUsers] = await connection.query(`SELECT id, email FROM users`);
      console.log('📋 All users in database:');
      allUsers.forEach(u => console.log(`- ID: ${u.id}, Email: "${u.email}"`));
      
      // Case-insensitive email lookup with trimming
      const [result] = await connection.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, 
        [emailTrimmed]  // Use trimmed email
      );

      console.log(`🔎 Query executed: SELECT * FROM users WHERE LOWER(email) = LOWER('${emailTrimmed}')`);
      console.log(`📊 Query result count: ${result.length}`);

      if (result.length === 0) {
        connection.release();
        console.log(`❌ User not found for email: "${email}"`);
        return res.status(404).json({ 
          success: false,
          message: "No account found with that email address.",
          exists: false
        });
      }

      const user = result[0];
      console.log(`✅ User found: ID=${user.id}, Name=${user.name}, Email=${user.email}`);
      
      const resetToken = generateToken();
      const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await connection.query(
        `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
        [resetToken, resetTokenExpires, user.id]
      );

      connection.release();
      
      const resetLink = `http://10.10.1.71:5173/reset-password?token=${resetToken}`;
      console.log(`🔗 Reset link generated: ${resetLink}`);
      
      try {
        await sendResetPasswordEmail(email, resetLink);
        console.log(`📤 Password reset email sent successfully to ${email}`);
        
        res.json({ 
          success: true,
          message: "Password reset link sent to your email!",
          exists: true
        });
      } catch (emailError) {
        console.error("❌ Error sending password reset email:", emailError);
        res.status(500).json({ 
          success: false,
          message: "Failed to send password reset email. Please try again later." 
        });
      }
    } catch (error) {
      if (connection) connection.release();
      throw error;
    }
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ 
      success: false,
      message: "An unexpected error occurred. Please try again later." 
    });
  }
};

module.exports = { forgotPassword };