// tokenUtils.js
const crypto = require("crypto");

// Generate a random token
const generateToken = () => crypto.randomBytes(20).toString("hex");

module.exports = { generateToken };