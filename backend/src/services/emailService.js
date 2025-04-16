// emailService.js
const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables if not already loaded

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { 
    user: process.env.EMAIL_USER || "olores.jayrm@gmail.com", 
    pass: process.env.EMAIL_PASS || "obyvlbyylrcflmas" 
  },
  tls: { rejectUnauthorized: false },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) console.error("Nodemailer Error:", error);
  else console.log("Server is ready to take our messages");
});

// Send verification email
const sendVerificationEmail = async (email, link) => {
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${link}">here</a> to verify your email. This link expires in 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendResetPasswordEmail = async (email, link) => {
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };