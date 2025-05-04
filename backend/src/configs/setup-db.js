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
    
    // Create onboarding tables using the SQL file
    console.log('- Creating onboarding tables from SQL file...');
    try {
      const onboardingTablesPath = path.join(__dirname, 'sql', 'onboarding_tables.sql');
      const onboardingTablesSQL = await fs.readFile(onboardingTablesPath, 'utf8');
      
      // Split the SQL file into individual statements
      const statements = onboardingTablesSQL.split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      // Execute each statement
      for (const statement of statements) {
        await connection.query(statement);
      }
      
      console.log('  ✓ Onboarding tables created successfully!');
    } catch (error) {
      console.error('  ✗ Error creating onboarding tables:', error.message);
      
      // Fallback to inline SQL if file not found
      console.log('  ⚠ Falling back to inline SQL for onboarding tables');
      
      console.log('  - Creating employee_equipment table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS employee_equipment (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          equipment_type VARCHAR(100) NOT NULL,
          description TEXT,
          status ENUM('Requested', 'Ordered', 'Assigned', 'Cancelled') DEFAULT 'Requested',
          request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fulfillment_date DATE DEFAULT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  - Creating employee_documents table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS employee_documents (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          document_type VARCHAR(100) NOT NULL,
          document_name VARCHAR(255) NOT NULL,
          required BOOLEAN DEFAULT TRUE,
          required_by_date DATE NOT NULL,
          status ENUM('Pending', 'Submitted', 'Verified', 'Rejected') DEFAULT 'Pending',
          submission_date DATE DEFAULT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  - Creating employee_training table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS employee_training (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          training_type VARCHAR(100) NOT NULL,
          description TEXT,
          trainer VARCHAR(100),
          location VARCHAR(255),
          scheduled_date DATE,
          scheduled_time TIME,
          duration_minutes INT DEFAULT 60,
          status ENUM('Scheduled', 'Completed', 'Cancelled', 'Postponed') DEFAULT 'Scheduled',
          completion_date DATE DEFAULT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      
      console.log('  - Creating equipment_types table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS equipment_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('  - Creating document_types table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS document_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          required BOOLEAN DEFAULT TRUE,
          days_to_submit INT DEFAULT 7,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('  - Creating training_types table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS training_types (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          duration_minutes INT DEFAULT 60,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if reference tables have data, if not, add sample data
    const [equipmentTypes] = await connection.query("SELECT COUNT(*) as count FROM equipment_types");
    if (equipmentTypes[0].count === 0) {
      console.log('- Inserting sample equipment types...');
      await connection.query(`
        INSERT INTO equipment_types (name, description) VALUES
        ('Laptop', 'Standard company laptop with appropriate software'),
        ('Monitor', '24-inch monitor for workstation'),
        ('Mouse', 'Wireless ergonomic mouse'),
        ('Keyboard', 'Ergonomic keyboard for desk use'),
        ('Phone', 'Company mobile phone or desk phone'),
        ('Headset', 'Noise-cancelling headset for calls'),
        ('Office Chair', 'Ergonomic office chair'),
        ('Standing Desk', 'Height-adjustable desk for ergonomic work')
      `);
    }
    
    const [documentTypes] = await connection.query("SELECT COUNT(*) as count FROM document_types");
    if (documentTypes[0].count === 0) {
      console.log('- Inserting sample document types...');
      await connection.query(`
        INSERT INTO document_types (name, description, required, days_to_submit) VALUES
        ('ID Proof', 'Government-issued ID like passport or driver license', TRUE, 3),
        ('Bank Details', 'Bank account information for salary payment', TRUE, 7),
        ('Tax Forms', 'Required tax documentation', TRUE, 7),
        ('Employment Contract', 'Signed employment contract', TRUE, 1),
        ('Education Certificates', 'Proof of education qualifications', TRUE, 14),
        ('Work Reference', 'References from previous employers', FALSE, 14),
        ('Background Check Consent', 'Consent for background verification', TRUE, 3),
        ('Health Insurance Form', 'Form for health insurance enrollment', TRUE, 7)
      `);
    }
    
    const [trainingTypes] = await connection.query("SELECT COUNT(*) as count FROM training_types");
    if (trainingTypes[0].count === 0) {
      console.log('- Inserting sample training types...');
      await connection.query(`
        INSERT INTO training_types (name, description, duration_minutes) VALUES
        ('Company Orientation', 'Introduction to company culture, values, and history', 120),
        ('Health & Safety', 'Workplace health and safety procedures', 60),
        ('IT Systems', 'Introduction to IT systems and security protocols', 90),
        ('HR Policies', 'Overview of HR policies and procedures', 60),
        ('Department Introduction', 'Specific department onboarding and introductions', 120),
        ('Role-specific Training', 'Specialized training for specific job role', 180),
        ('Customer Service', 'Customer service standards and procedures', 90),
        ('Product Knowledge', 'Detailed training on company products and services', 120)
      `);
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