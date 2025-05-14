const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'olores.jayrm@gmail.com',
    pass: process.env.SMTP_PASS || 'obyvlbyylrcflmas'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify the connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email service warning:', error.message);
    console.log('Email notifications will be disabled until the service is available.');
  } else {
    console.log('✅ Email service is ready');
  }
});

module.exports = transporter; 