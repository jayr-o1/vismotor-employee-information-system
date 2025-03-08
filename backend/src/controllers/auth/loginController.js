const db = require("../../configs/db");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required!" });
  }

  try {
    const [result] = await db.promise().query(`SELECT * FROM Users WHERE email = ?`, [email]);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result[0];
    const isVerified = user.isVerified instanceof Buffer ? user.isVerified.readUInt8(0) : user.isVerified;

    if (isVerified !== 1) {
      return res.status(400).json({ message: "Email not verified! Please check your email for the verification link." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = { login };
