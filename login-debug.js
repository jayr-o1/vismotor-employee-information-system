// Login Debugging Script
// This script will help diagnose issues with the login process
// Run with: node login-debug.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Simple test credentials
const TEST_EMAIL = 'it.admin@vismotor.com';
const TEST_PASSWORD = 'Admin123!';

// Create a fresh password hash for comparison
const createHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Function to check database connection
const checkDatabaseConnection = async () => {
  try {
    // Connection configuration from environment or default
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vismotordb',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    console.log('=== DATABASE CONNECTION TEST ===');
    console.log('Trying to connect to database with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });

    // Try to connect
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to database!');
    
    // Check database schema
    console.log('\n=== DATABASE SCHEMA TEST ===');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Check users table structure
    const [userColumns] = await connection.query('DESCRIBE users');
    console.log('\nUsers table structure:');
    userColumns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check for existing users
    console.log('\n=== USER EXISTENCE TEST ===');
    const [users] = await connection.query('SELECT id, name, email, role, is_verified FROM users LIMIT 5');
    console.log(`Found ${users.length} users in the database`);
    if (users.length > 0) {
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.is_verified}`);
      });
    } else {
      console.log('⚠️ No users found in the database. You need to create users first.');
    }
    
    // Check if the test email exists
    console.log(`\nLooking for test email "${TEST_EMAIL}"...`);
    const [testUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [TEST_EMAIL]);
    
    if (testUsers.length === 0) {
      console.log(`⚠️ Test user with email "${TEST_EMAIL}" not found. Creating it now...`);
      
      // Create a new test user
      const hashedPassword = await createHashedPassword(TEST_PASSWORD);
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        ['Test Admin', TEST_EMAIL, hashedPassword, 'it_admin', true]
      );
      console.log(`✅ Created test user with ID: ${result.insertId}`);
      
      // Fetch the created user
      const [newUser] = await connection.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      console.log('New user details:', {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
        verified: newUser[0].is_verified
      });
    } else {
      const user = testUsers[0];
      console.log(`✅ Found test user: "${user.name}" with role "${user.role}", verified: ${user.is_verified}`);
      
      // Now test password verification
      console.log('\n=== PASSWORD VERIFICATION TEST ===');
      console.log(`Testing password verification for "${TEST_EMAIL}" with password "${TEST_PASSWORD}"`);
      
      // Test the password against the stored hash
      const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, user.password);
      if (isPasswordValid) {
        console.log('✅ Password verification SUCCESSFUL');
      } else {
        console.log('❌ Password verification FAILED');
        console.log('Stored hash:', user.password);
        
        // Create a new hash for the same password for comparison
        const newHash = await createHashedPassword(TEST_PASSWORD);
        console.log('New hash for same password:', newHash);
        
        // Try updating the password with a fresh hash
        console.log('Updating user password with a fresh hash...');
        await connection.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
        console.log('✅ Password updated. Please try logging in again with:', {
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
      }
    }
    
    // Close connection
    await connection.end();
    console.log('\n✅ Tests complete! Database connection closed.');
    
  } catch (error) {
    console.error('\n❌ ERROR in diagnostic script:', error);
    process.exit(1);
  }
};

// Run the tests
checkDatabaseConnection()
  .then(() => {
    console.log('\n===== ALL DIAGNOSTICS COMPLETE =====');
    console.log('If all tests passed but you still cannot log in, please check:');
    console.log('1. The login controller in your backend code');
    console.log('2. Network requests in your browser\'s developer tools');
    console.log('3. Server logs for any errors during login attempts');
    console.log('\nTry logging in with:');
    console.log(`Email: ${TEST_EMAIL}`);
    console.log(`Password: ${TEST_PASSWORD}`);
  })
  .catch(error => {
    console.error('Fatal error in diagnostic script:', error);
  }); 