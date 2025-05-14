require('dotenv').config(); // Load environment variables if not already loaded

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';

module.exports = {
  JWT_SECRET
}; 