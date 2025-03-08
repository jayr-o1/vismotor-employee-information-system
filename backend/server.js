const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mysql = require("mysql2"); // Use mysql2 for MySQL database connection
const crypto = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Parse JSON requests

// MySQL Database Connection
const db = mysql.createPool({
  host: 'localhost', // Your MySQL host
  user: 'root', // Your MySQL username
  password: '1234', // Your MySQL password
  database: 'VismotorDB', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Generate a random token
function generateToken() {
  return crypto.randomBytes(20).toString("hex");
}

// Send email verification
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

// Send password reset email
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

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required!" });
  }

  try {
    // Check if the user exists
    const [result] = await db.promise().query(
      `SELECT * FROM Users WHERE email = ?`,
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result[0];

    // Debugging: Log the user's verification status and its type
    console.log("User verification status:", user.isVerified);
    console.log("Type of isVerified:", typeof user.isVerified);

    // Convert isVerified to a number if it's a buffer
    const isVerified = user.isVerified instanceof Buffer ? user.isVerified.readUInt8(0) : user.isVerified;

    // Check if the account is verified
    if (isVerified !== 1) {
      return res.status(400).json({ message: "Email not verified! Please check your email for the verification link." });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // If everything is correct, return a success message or a token
    res.json({ message: "Login successful!", user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

// Signup route
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
    // Check if the email already exists
    const [existingEmail] = await db.promise().query(
      `SELECT * FROM Users WHERE email = ?`,
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    // Check if the username already exists
    const [existingUsername] = await db.promise().query(
      `SELECT * FROM Users WHERE username = ?`,
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({ message: "Username is already taken!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    // Insert the new user into the database
    await db.promise().query(
      `INSERT INTO Users (firstName, lastName, username, email, password, isVerified, verificationToken, verificationTokenExpires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        0, // isVerified
        verificationToken,
        verificationTokenExpires,
      ]
    );

    // Send verification email
    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);

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
    console.log("Verification token received:", token);

    // Check if the token exists in the database
    const [result] = await db.promise().query(
      `SELECT * FROM Users WHERE verificationToken = ?`,
      [token]
    );

    if (result.length === 0) {
      console.log("Invalid token:", token);
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = result[0];
    console.log("User found for token:", user);

    // Check if the token has expired
    if (new Date() > new Date(user.verificationTokenExpires)) {
      console.log("Token expired for user:", user.email);
      return res.status(400).json({ message: "Token expired!" });
    }

    // Mark user as verified
    await db.promise().query(
      `UPDATE Users SET isVerified = 1, verificationToken = NULL, verificationTokenExpires = NULL WHERE verificationToken = ?`,
      [token]
    );

    console.log("User verified successfully:", user.email);
    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

// Request password reset
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  try {
    const [result] = await db.promise().query(
      `SELECT * FROM Users WHERE email = ?`,
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result[0];
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await db.promise().query(
      `UPDATE Users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?`,
      [resetToken, resetTokenExpires, email]
    );

    // Send reset password email
    const resetLink = `http://localhost:5000/api/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(email, resetLink);

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
    const [result] = await db.promise().query(
      `SELECT * FROM Users WHERE resetToken = ?`,
      [token]
    );

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
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
