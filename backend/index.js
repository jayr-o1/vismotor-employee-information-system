// index.js
const express = require('express');
const cors = require('cors');
const { pool, poolConnect } = require('./config/db');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Test database connection
poolConnect
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});