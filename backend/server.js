const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
require('dotenv').config(); // Load environment variables
const db = require("./src/configs/database");
const authRoutes = require("./src/controllers/auth/routes/routes");
const employeeRoutes = require("./src/controllers/employee/routes");
const applicantRoutes = require("./src/controllers/applicant/routes");
const userRoutes = require("./src/controllers/user/routes");
const dashboardRoutes = require("./src/controllers/dashboard/routes");
const applicationsRoutes = require("./src/routes/applications");
const { validateToken, ensureVerified } = require("./src/utils/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Allow requests from the frontend and network
app.use(cors({
  origin: [
    FRONTEND_URL,
    "http://10.10.1.71:5173", // Your network IP with frontend port
    /^http:\/\/192\.168\.\d+\.\d+:5173$/, // For other possible local network IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/ // For 10.x.x.x network IPs
  ]
}));

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
    '/api/check-user',
    '/api/applications/upload',
    '/api/applications/submit',
    '/api/applicants/download',
    '/api/employees', // This will match /api/employees/:id/public-profile
    '/api/applicants', // This will match /api/applicants/:id/public-profile
  ];
  
  // Check if the request path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  // Special check for the public profile endpoints
  const isPublicProfilePath = 
    req.path.match(/\/api\/employees\/\d+\/public-profile$/) || 
    req.path.match(/\/api\/applicants\/\d+\/public-profile$/);
  
  if (isPublicPath || isPublicProfilePath) {
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
app.use(dashboardRoutes);
app.use('/api/applications', applicationsRoutes);

// Test database connection before starting server
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connection = await mysql.createConnection(db.config);
    await connection.ping();
    console.log('✅ Database connection successful!');
    await connection.end();
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(`✅ Server accessible at http://10.10.1.71:${PORT}`);
      console.log(`API Documentation: http://0.0.0.0:${PORT}/api-docs`);
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