const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// SQL statements to create tables and insert sample data
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

const INSERT_SAMPLE_APPLICANTS = `
INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES 
('John Doe', 'john.doe@example.com', '123-456-7890', 'Web Developer', 'Bachelor in Computer Science', '5 years experience in web development', 'JavaScript, React, Node.js, MySQL', 'Pending', NOW()),
('Jane Smith', 'jane.smith@example.com', '987-654-3210', 'UI/UX Designer', 'Master in Design', '3 years experience in UI/UX design', 'Figma, Adobe XD, Photoshop, Illustrator', 'Reviewed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Mike Johnson', 'mike.johnson@example.com', '555-123-4567', 'Project Manager', 'MBA', '7 years experience in IT project management', 'Agile, Scrum, JIRA, Confluence', 'Scheduled', DATE_SUB(NOW(), INTERVAL 5 DAY))
`;

const INSERT_SAMPLE_USERS = `
INSERT INTO users (name, email, password, role, is_verified) VALUES 
('Admin User', 'admin@example.com', '$2b$10$wJ9.iD3.g8Md9GNRYDUDbOz9HyXlBo1dWEjF8QjxZ7FqQ8wVpLrfW', 'admin', true), 
('HR Manager', 'hr@example.com', '$2b$10$wJ9.iD3.g8Md9GNRYDUDbOz9HyXlBo1dWEjF8QjxZ7FqQ8wVpLrfW', 'hr', true),
('Regular User', 'user@example.com', '$2b$10$wJ9.iD3.g8Md9GNRYDUDbOz9HyXlBo1dWEjF8QjxZ7FqQ8wVpLrfW', 'user', true)
`;

const INSERT_SAMPLE_FEEDBACK = `
INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES 
(2, 'Excellent portfolio and strong design skills. Schedule for interview.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY))
`;

const INSERT_SAMPLE_INTERVIEWS = `
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY))
`;

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
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    console.log('- Inserting sample applicants...');
    await connection.query(INSERT_SAMPLE_APPLICANTS);
    
    console.log('- Inserting sample users...');
    await connection.query(INSERT_SAMPLE_USERS);
    
    console.log('- Inserting sample feedback...');
    await connection.query(INSERT_SAMPLE_FEEDBACK);
    
    console.log('- Inserting sample interviews...');
    await connection.query(INSERT_SAMPLE_INTERVIEWS);
    
    // Verify tables
    console.log('\nVerifying tables were created...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${database}`];
      console.log(`- ${tableName}`);
    });
    
    // Check sample data
    console.log('\nVerifying sample data:');
    const [applicants] = await connection.query('SELECT COUNT(*) as count FROM applicants');
    console.log(`- Applicants count: ${applicants[0].count}`);
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`- Users count: ${users[0].count}`);
    
    const [feedback] = await connection.query('SELECT COUNT(*) as count FROM feedback');
    console.log(`- Feedback count: ${feedback[0].count}`);
    
    const [interviews] = await connection.query('SELECT COUNT(*) as count FROM interviews');
    console.log(`- Interviews count: ${interviews[0].count}`);
    
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