const knex = require('knex');
const knexConfig = require('../../knexfile');

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Initialize knex connection
const db = knex(config);

// Test the connection when this module is loaded
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful!');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your MySQL configuration');
  });

module.exports = db; 