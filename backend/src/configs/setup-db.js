const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// SQL statements to create tables and insert sample data
const CREATE_APPLICANTS_TABLE = `
CREATE TABLE IF NOT EXISTS applicants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  other_gender VARCHAR(100),
  age VARCHAR(10),
  marital_status VARCHAR(50),
  other_marital_status VARCHAR(100),
  highest_education VARCHAR(100),
  other_highest_education VARCHAR(100),
  region VARCHAR(50),
  province VARCHAR(50),
  city VARCHAR(50),
  barangay VARCHAR(100),
  street_address TEXT,
  position VARCHAR(100) NOT NULL,
  other_position VARCHAR(100),
  branch_department VARCHAR(100),
  other_branch_department VARCHAR(100),
  date_availability VARCHAR(100),
  other_date_availability VARCHAR(100),
  desired_pay VARCHAR(100),
  job_post_source VARCHAR(100),
  other_job_source VARCHAR(100),
  previously_employed VARCHAR(10),
  resume_filename VARCHAR(255),
  resume_originalname VARCHAR(255),
  resume_path VARCHAR(255),
  house_sketch_filename VARCHAR(255),
  house_sketch_originalname VARCHAR(255),
  house_sketch_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending',
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_APPLICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  other_gender VARCHAR(100),
  age VARCHAR(10),
  marital_status VARCHAR(50),
  other_marital_status VARCHAR(100),
  highest_education VARCHAR(100),
  other_highest_education VARCHAR(100),
  region VARCHAR(50),
  province VARCHAR(50),
  city VARCHAR(50),
  barangay VARCHAR(100),
  street_address TEXT,
  position_applying_for VARCHAR(100),
  other_position VARCHAR(100),
  branch_department VARCHAR(100),
  other_branch_department VARCHAR(100),
  date_availability VARCHAR(100),
  other_date_availability VARCHAR(100),
  desired_pay VARCHAR(100),
  job_post_source VARCHAR(100),
  other_job_source VARCHAR(100),
  previously_employed VARCHAR(10),
  resume_filename VARCHAR(255),
  resume_originalname VARCHAR(255),
  resume_path VARCHAR(255),
  house_sketch_filename VARCHAR(255),
  house_sketch_originalname VARCHAR(255),
  house_sketch_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Pending',
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

async function setupDatabase() {
  let connection;
  
  try {
    // First connect without database name
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
    
    // Drop existing tables if they exist
    console.log('Dropping existing tables if they exist...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS employees');
    await connection.query('DROP TABLE IF EXISTS interviews');
    await connection.query('DROP TABLE IF EXISTS feedback');
    await connection.query('DROP TABLE IF EXISTS applicants');
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Create tables
    console.log('Creating tables...');
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
    
    // No sample data insertion
    
    // Verify tables
    console.log('\nVerifying tables were created...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${database}`];
      console.log(`- ${tableName}`);
    });
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 