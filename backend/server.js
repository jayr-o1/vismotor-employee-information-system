const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config(); // Load environment variables
const dbConfig = require("./src/configs/database");
const authRoutes = require("./src/controllers/auth/routes/routes");
const employeeRoutes = require("./src/controllers/employee/routes");
const applicantRoutes = require("./src/controllers/applicant/routes");
const userRoutes = require("./src/controllers/user/routes");
const { validateToken, ensureVerified } = require("./src/utils/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Allow requests from the frontend
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json());

// Authentication middleware that excludes auth endpoints
app.use((req, res, next) => {
  // Skip auth for public endpoints
  const publicPaths = [
    '/api/login',
    '/api/signup',
    '/api/verify-email',
    '/api/forgot-password',
    '/api/reset-password',
    '/api/resend-verification',
    '/api/check-user'
  ];
  
  // Check if the request path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  if (isPublicPath) {
    return next();
  }
  
  // For protected routes, apply both validateToken and ensureVerified
  validateToken(req, res, (err) => {
    if (err) return; // Error response was sent by validateToken
    
    // Now check if user is verified
    ensureVerified(req, res, next);
  });
});

// Routes
app.use(authRoutes);
app.use(employeeRoutes);
app.use(applicantRoutes);
app.use(userRoutes);

// Test database connection before starting server
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log('✅ Database connection successful!');
    await connection.end();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Make sure:');
    console.error('1. MySQL server is running');
    console.error('2. Database credentials in src/configs/database.js are correct');
    console.error('3. Database has been initialized: npm run setup-db');
    process.exit(1);
  }
}

startServer();