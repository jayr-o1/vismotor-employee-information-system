const mysql = require('mysql2/promise');
const dbConfig = require('./database');
const fs = require('fs').promises;
const path = require('path');

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

const CREATE_ONBOARDING_CHECKLISTS_TABLE = `
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE DEFAULT NULL,
  due_date DATE,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
)`;

const CREATE_ONBOARDING_TEMPLATES_TABLE = `
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  days_to_complete INT DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    
    // Create tables (don't drop existing tables)
    console.log('Creating tables if they don\'t exist...');
    console.log('- Creating users table...');
    await connection.query(CREATE_USERS_TABLE);
    
    console.log('- Creating applicants table...');
    await connection.query(CREATE_APPLICANTS_TABLE);
    
    console.log('- Creating feedback table...');
    await connection.query(CREATE_FEEDBACK_TABLE);
    
    console.log('- Creating interviews table...');
    await connection.query(CREATE_INTERVIEWS_TABLE);
    
    console.log('- Creating employees table...');
    await connection.query(CREATE_EMPLOYEES_TABLE);
    
    console.log('- Creating onboarding_checklists table...');
    await connection.query(CREATE_ONBOARDING_CHECKLISTS_TABLE);
    
    console.log('- Creating onboarding_templates table...');
    await connection.query(CREATE_ONBOARDING_TEMPLATES_TABLE);
    
    // Insert sample onboarding templates
    console.log('- Checking if onboarding templates exist...');
    const [templateCount] = await connection.query("SELECT COUNT(*) as count FROM onboarding_templates");
    
    if (templateCount[0].count === 0) {
      console.log('- Inserting sample onboarding templates...');
      
      // Load and execute the SQL file
      try {
        const templatesPath = path.join(__dirname, 'sql', 'onboarding_checklist.sql');
        const templatesSQL = await fs.readFile(templatesPath, 'utf8');
        
        // Extract just the INSERT statement from the SQL file
        const insertStatement = templatesSQL.split('INSERT INTO onboarding_templates')[1];
        if (insertStatement) {
          await connection.query('INSERT INTO onboarding_templates ' + insertStatement);
          console.log('  ✓ Sample templates inserted successfully!');
        } else {
          console.error('  ✗ Could not find INSERT statement in SQL file');
        }
      } catch (error) {
        console.error('  ✗ Error inserting sample templates:', error.message);
      }
    }

    // List tables in database
    const [tables] = await connection.query(`SHOW TABLES FROM ${database}`);
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${database}`];
      console.log(`- ${tableName}`);
    });

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 