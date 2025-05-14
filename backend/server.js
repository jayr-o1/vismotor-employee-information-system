const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
require('dotenv').config(); // Load environment variables

// Import configuration
const db = require("./src/config/database");

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const employeeRoutes = require("./src/routes/employee.routes");
const applicantRoutes = require("./src/routes/applicant.routes");
const userRoutes = require("./src/routes/user.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");

// Import middleware
const { validateToken, ensureVerified } = require("./src/middleware/auth.middleware");
const { errorHandler, notFoundHandler } = require("./src/middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Create subdirectories
const profilePicsDir = path.join(uploadsDir, 'profile-pictures');
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
  console.log('Created profile-pictures directory at:', profilePicsDir);
}

const applicantFilesDir = path.join(uploadsDir, 'applicant-files');
if (!fs.existsSync(applicantFilesDir)) {
  fs.mkdirSync(applicantFilesDir, { recursive: true });
  console.log('Created applicant-files directory at:', applicantFilesDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  // Skip auth for public endpoints and static file requests
  if (req.path.startsWith('/uploads')) {
    return next();
  }
  
  const publicPaths = [
    '/api/login',
    '/api/signup',
    '/api/verify-email',
    '/api/forgot-password',
    '/api/reset-password',
    '/api/resend-verification',
    '/api/check-user',
    '/api/dashboard',
    '/api/dashboard/applicant-trends',
    '/api/applications/upload',
    '/api/applications/submit',
    '/api/applicants/download',
    '/api/profile-pictures',
    '/api/employees', // This will match /api/employees/:id/public-profile
    '/api/applicants', // This will match /api/applicants/:id/public-profile
    '/api/equipment-types',
    '/api/document-types',
    '/api/training-types',
  ];
  
  // Check if the request path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  // Special check for the public profile endpoints
  const isPublicProfilePath = 
    req.path.match(/\/api\/employees\/\d+\/public-profile$/) || 
    req.path.match(/\/api\/applicants\/\d+\/public-profile$/);
    
  // Add direct match for the problem endpoints
  const isExactPublicPath = 
    req.path === '/api/equipment-types' || 
    req.path === '/api/document-types' || 
    req.path === '/api/training-types';
  
  if (isPublicPath || isPublicProfilePath || isExactPublicPath) {
    return next();
  }
  
  // For protected routes, apply both validateToken and ensureVerified
  validateToken(req, res, (err) => {
    if (err) return; // Error response was sent by validateToken
    
    // Now check if user is verified
    ensureVerified(req, res, next);
  });
});

// Apply routes
app.use(authRoutes);
app.use(employeeRoutes);
app.use(applicantRoutes);
app.use(userRoutes);
app.use(dashboardRoutes);

// Apply 404 handler and error handler
app.use(notFoundHandler);
app.use(errorHandler);

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
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Make sure:');
    console.error('1. MySQL server is running');
    console.error('2. Database credentials in src/config/database.js are correct');
    console.error('3. Database has been initialized: npm run setup-db');
    process.exit(1);
  }
}

startServer();