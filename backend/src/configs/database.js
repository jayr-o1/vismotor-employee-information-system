const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables if not already loaded

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'vismotordb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection when this module is loaded
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your MySQL configuration');
    // Not exiting the process here to allow the application to handle the connection failure
  });

// Export both the pool for promise-based usage and the configuration for direct access
module.exports = pool;
module.exports.config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'vismotordb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}; 