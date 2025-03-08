const db = require("../../configs/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/tokenUtils");
const { sendVerificationEmail } = require("../../services/emailService");

const signup = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ message: "Username must be between 3 and 20 characters and contain only letters, numbers, and underscores!" });
  }

  try {
    const [existingEmail] = await db.promise().query(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    const [existingUsername] = await db.promise().query(`SELECT * FROM Users WHERE username = ?`, [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ message: "Username is already taken!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateToken();
    const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.promise().query(
      `INSERT INTO Users (firstName, lastName, username, email, password, isVerified, verificationToken, verificationTokenExpires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, username, email, hashedPassword, 0, verificationToken, verificationTokenExpires]
    );

    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);

    res.status(201).json({ message: "Signup successful! Please check your email to verify your account." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { signup };