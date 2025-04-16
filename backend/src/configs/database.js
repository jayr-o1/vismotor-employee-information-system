// Database configuration
require('dotenv').config(); // Load environment variables if not already loaded

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234', // Update with your MySQL password - empty string is common for local development
  database: process.env.DB_DATABASE || 'vismotordb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}; 