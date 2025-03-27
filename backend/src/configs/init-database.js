const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// SQL statements to create tables
const CREATE_APPLICANTS_TABLE = `
CREATE TABLE IF NOT EXISTS applicants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  education TEXT,
  experience TEXT,
  skills TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  applied_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_FEEDBACK_TABLE = `
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  created_by VARCHAR(100) DEFAULT 'HR Team',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
)`;

const CREATE_INTERVIEWS_TABLE = `
CREATE TABLE IF NOT EXISTS interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  location VARCHAR(255),
  interviewer VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
)`;

const CREATE_EMPLOYEES_TABLE = `
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE SET NULL
)`;

async function initializeDatabase() {
  let connection;
  
  try {
    // First connect without database name to create the database if needed
    const { database, ...connectionConfig } = dbConfig;
    console.log('Connecting to MySQL server...');
    
    connection = await mysql.createConnection(connectionConfig);
    
    // Create database if it doesn't exist
    console.log(`Creating database '${database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    await connection.end();
    
    // Connect to the specific database
    console.log(`Connecting to database '${database}'...`);
    connection = await mysql.createConnection(dbConfig);
    
    // Create tables without dropping existing ones
    console.log('Creating tables (if they don\'t exist)...');
    
    console.log('- Creating applicants table...');
    await connection.query(CREATE_APPLICANTS_TABLE);
    
    console.log('- Creating users table...');
    await connection.query(CREATE_USERS_TABLE);
    
    console.log('- Creating feedback table...');
    await connection.query(CREATE_FEEDBACK_TABLE);
    
    console.log('- Creating interviews table...');
    await connection.query(CREATE_INTERVIEWS_TABLE);
    
    console.log('- Creating employees table...');
    await connection.query(CREATE_EMPLOYEES_TABLE);
    
    // Verify tables
    console.log('\nVerifying tables were created...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${database}`];
      console.log(`- ${tableName}`);
    });
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('The database and all required tables have been created.');
    console.log('You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    console.error('Please ensure MySQL is running and the connection details are correct.');
    console.error('You might need to update the database configuration in src/configs/database.js');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  initializeDatabase();
} else {
  // Export the function for use in other scripts
  module.exports = initializeDatabase;
} 