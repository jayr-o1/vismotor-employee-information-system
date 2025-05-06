// Script to create a user directly in the database
import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Database configuration from .env or default values
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'vismotordb'
};

// New user details
const newUser = {
  name: 'Test Admin',
  email: 'test@vismotor.com',
  password: '1234',
  role: 'it_admin'
};

async function createUser() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await createConnection(dbConfig);
    console.log('Connected to database:', dbConfig.database);
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [newUser.email]
    );
    
    if (existingUsers.length > 0) {
      console.log(`User with email ${newUser.email} already exists. Updating password...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      
      // Update user
      await connection.execute(
        'UPDATE users SET password = ?, is_verified = 1, name = ?, role = ? WHERE email = ?',
        [hashedPassword, newUser.name, newUser.role, newUser.email]
      );
      
      console.log('User updated successfully!');
    } else {
      console.log(`Creating new user: ${newUser.name} (${newUser.email})`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      
      // Insert new user
      await connection.execute(
        'INSERT INTO users (name, email, password, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [newUser.name, newUser.email, hashedPassword, newUser.role, 1]
      );
      
      console.log('User created successfully!');
    }
    
    // Retrieve and display all users
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, role, is_verified FROM users'
    );
    
    console.log('\nAll users in the database:');
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Verified: ${user.is_verified}`);
    });
    
    console.log('\nYou can now log in with:');
    console.log(`Email: ${newUser.email}`);
    console.log(`Password: ${newUser.password}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

createUser(); 