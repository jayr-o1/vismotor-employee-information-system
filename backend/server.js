const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { sql, poolPromise } = require("./src/config/db");

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Parse JSON requests

const crypto = require("crypto");

// Generate a random token
function generateToken() {
  return crypto.randomBytes(20).toString("hex");
}

// Modify the signup route to use a token instead of a code
app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Validate username
  if (username.length < 3 || username.length > 20) {
    return res
      .status(400)
      .json({ message: "Username must be between 3 and 20 characters!" });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res
      .status(400)
      .json({
        message: "Username can only contain letters, numbers, and underscores!",
      });
  }

  try {
    const pool = await poolPromise;

    // Check if the email already exists
    const existingEmail = await pool
      .request()
      .input("email", sql.NVarChar(100), email)
      .query(`SELECT * FROM Users WHERE email = @email`);

    if (existingEmail.recordset.length > 0) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    // Check if the username already exists
    const existingUsername = await pool
      .request()
      .input("username", sql.NVarChar(50), username)
      .query(`SELECT * FROM Users WHERE username = @username`);

    if (existingUsername.recordset.length > 0) {
      return res.status(400).json({ message: "Username is already taken!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    // Insert the new user into the database
    await pool
      .request()
      .input("firstName", sql.NVarChar(50), firstName)
      .input("lastName", sql.NVarChar(50), lastName)
      .input("username", sql.NVarChar(50), username)
      .input("email", sql.NVarChar(100), email)
      .input("password", sql.NVarChar(255), hashedPassword)
      .input("isVerified", sql.Bit, 0)
      .input("verificationToken", sql.NVarChar(255), verificationToken)
      .input("verificationTokenExpires", sql.DateTime, verificationTokenExpires)
      .query(`INSERT INTO Users (firstName, lastName, username, email, password, isVerified, verificationToken, verificationTokenExpires)
                VALUES (@firstName, @lastName, @username, @email, @password, @isVerified, @verificationToken, @verificationTokenExpires)`);

    // Send verification email
    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;
    sendVerificationEmail(email, verificationLink);

    res
      .status(201)
      .json({
        message:
          "Signup successful! Please check your email to verify your account.",
      });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

// Email verification route
app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required!" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("token", sql.NVarChar(255), token)
      .query(`SELECT * FROM Users WHERE verificationToken = @token`);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result.recordset[0];

    if (new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ message: "Token expired!" });
    }

    // Mark user as verified
    await pool
      .request()
      .input("token", sql.NVarChar(255), token)
      .query(
        `UPDATE Users SET isVerified = 1, verificationToken = NULL, verificationTokenExpires = NULL WHERE verificationToken = @token`
      );

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

async function sendVerificationEmail(email, link) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: "olores.jayrm@gmail.com", pass: "obyvlbyylrcflmas" },
    tls: { rejectUnauthorized: false }, // Add this for debugging SSL/TLS issues
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error("Nodemailer Error:", error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  let mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${link}">here</a> to verify your email. This link expires in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

// Request password reset
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar(100), email)
      .query(`SELECT * FROM Users WHERE email = @email`);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result.recordset[0];
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await pool
      .request()
      .input("email", sql.NVarChar(100), email)
      .input("resetToken", sql.NVarChar(255), resetToken)
      .input("resetTokenExpires", sql.DateTime, resetTokenExpires)
      .query(
        `UPDATE Users SET resetToken = @resetToken, resetTokenExpires = @resetTokenExpires WHERE email = @email`
      );

    // Send reset password email
    const resetLink = `http://localhost:5000/api/reset-password?token=${resetToken}`;
    sendResetPasswordEmail(email, resetLink);

    res.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

// Reset password
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required!" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("token", sql.NVarChar(255), token)
      .query(`SELECT * FROM Users WHERE resetToken = @token`);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result.recordset[0];

    if (new Date() > user.resetTokenExpires) {
      return res.status(400).json({ message: "Token expired!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool
      .request()
      .input("token", sql.NVarChar(255), token)
      .input("password", sql.NVarChar(255), hashedPassword)
      .query(
        `UPDATE Users SET password = @password, resetToken = NULL, resetTokenExpires = NULL WHERE resetToken = @token`
      );

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

async function sendResetPasswordEmail(email, link) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: "olores.jayrm@gmail.com", pass: "obyvlbyylrcflmas" },
    tls: { rejectUnauthorized: false }, // Add this for debugging SSL/TLS issues
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error("Nodemailer Error:", error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  let mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
