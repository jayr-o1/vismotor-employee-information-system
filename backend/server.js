const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dbConfig = require("./src/configs/database");
const authRoutes = require("./src/controllers/auth/routes/routes");
const employeeRoutes = require("./src/controllers/employee/routes");
const applicantRoutes = require("./src/controllers/applicant/routes");
const userRoutes = require("./src/controllers/user/routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the frontend
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
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