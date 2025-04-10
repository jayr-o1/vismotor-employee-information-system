const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function createTestUser() {
  let connection;
  
  try {
    // Connect to the database
    console.log(`Connecting to database '${dbConfig.database}'...`);
    connection = await mysql.createConnection(dbConfig);
    
    // Generate password hash
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log(`Generated hash for password '${password}':`, hashedPassword);
    
    // Check if test user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['testuser@example.com']
    );
    
    if (existingUsers.length > 0) {
      // Update existing user
      console.log('Test user already exists, updating password...');
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, 'testuser@example.com']
      );
    } else {
      // Insert new test user
      console.log('Creating new test user...');
      await connection.query(
        'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
        ['Test User', 'testuser@example.com', hashedPassword, 'user', true]
      );
    }
    
    console.log('\n✅ Test user created/updated successfully!');
    console.log('You can now login with:');
    console.log('Email: testuser@example.com');
    console.log('Password: password123');
    
    // Also update the existing sample users for consistency
    console.log('\nUpdating existing sample users...');
    await connection.query(
      'UPDATE users SET password = ? WHERE email IN (?, ?, ?)',
      [hashedPassword, 'admin@example.com', 'hr@example.com', 'user@example.com']
    );
    
    console.log('✅ Sample users updated with new password hash!');
    
  } catch (error) {
    console.error('\n❌ Error creating test user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUser(); 