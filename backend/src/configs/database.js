// Database configuration
module.exports = {
  host: 'localhost',
  user: 'root',
  password: '1234', // Update with your MySQL password - empty string is common for local development
  database: 'vismotordb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}; 