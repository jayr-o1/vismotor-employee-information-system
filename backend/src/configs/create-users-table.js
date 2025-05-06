const db = require('./database');

async function createUsersTable() {
  try {
    const connection = await db.getConnection();
    
    // Check if users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      // Create users table
      await connection.query(`
        CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'staff',
          profile_picture VARCHAR(255),
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully');
    } else {
      // Check if profile_picture column exists
      const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'profile_picture'");
      
      if (columns.length === 0) {
        // Add profile_picture column to existing table
        await connection.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) AFTER role");
        console.log('Added profile_picture column to users table');
      } else {
        console.log('profile_picture column already exists in users table');
      }
    }
    
    connection.release();
    
    return true;
  } catch (error) {
    console.error('Error setting up users table:', error);
    throw error;
  }
}

module.exports = { createUsersTable }; 