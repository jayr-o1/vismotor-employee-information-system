const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// SQL definitions for each table separately
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
  status ENUM('Pending', 'Reviewed', 'Scheduled', 'Interviewed', 'Rejected', 'Accepted', 'Onboarded') DEFAULT 'Pending',
  applied_date DATETIME NOT NULL,
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
  status ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
)`;

// Sample data queries
const INSERT_SAMPLE_APPLICANTS = `
INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date)
VALUES 
('John Doe', 'john.doe@example.com', '123-456-7890', 'Web Developer', 'Bachelor in Computer Science', '5 years experience in web development', 'JavaScript, React, Node.js, MySQL', 'Pending', NOW()),
('Jane Smith', 'jane.smith@example.com', '987-654-3210', 'UI/UX Designer', 'Master in Design', '3 years experience in UI/UX design', 'Figma, Adobe XD, Photoshop, Illustrator', 'Reviewed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Mike Johnson', 'mike.johnson@example.com', '555-123-4567', 'Project Manager', 'MBA', '7 years experience in IT project management', 'Agile, Scrum, JIRA, Confluence', 'Scheduled', DATE_SUB(NOW(), INTERVAL 5 DAY))
`;

const INSERT_SAMPLE_FEEDBACK = `
INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at)
VALUES 
(2, 'Excellent portfolio and strong design skills. Schedule for interview.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY))
`;

const INSERT_SAMPLE_INTERVIEWS = `
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at)
VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY))
`;

async function initDb() {
  let connection;

  try {
    // Create connection with database config (without database name)
    const { database, ...connectionConfig } = dbConfig;
    
    console.log('Trying to connect to MySQL server...');
    
    try {
      connection = await mysql.createConnection(connectionConfig);
      console.log('Connected to MySQL server successfully!');
    } catch (err) {
      console.error('ERROR: Could not connect to MySQL. Please check your MySQL credentials:');
      console.error(`- Host: ${connectionConfig.host}`);
      console.error(`- User: ${connectionConfig.user}`);
      console.error(`- Password: ${connectionConfig.password ? '[PROVIDED]' : '[EMPTY]'}`);
      console.error('\nMake sure:');
      console.error('1. MySQL service is running');
      console.error('2. Your credentials in backend/src/configs/database.js are correct');
      console.error('3. The MySQL user has sufficient privileges');
      throw err;
    }
    
    // Create database if it doesn't exist
    console.log(`Creating database ${database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    
    // Close connection
    await connection.end();
    
    // Create new connection with database name
    console.log(`Connecting to database ${database}...`);
    connection = await mysql.createConnection(dbConfig);
    
    // Create tables - execute each statement separately
    console.log('Creating tables...');
    console.log('- Creating applicants table...');
    await connection.query(CREATE_APPLICANTS_TABLE);
    
    console.log('- Creating feedback table...');
    await connection.query(CREATE_FEEDBACK_TABLE);
    
    console.log('- Creating interviews table...');
    await connection.query(CREATE_INTERVIEWS_TABLE);
    
    // Check if applicants table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM applicants');
    
    // Insert sample data if table is empty
    if (rows[0].count === 0) {
      console.log('Inserting sample data...');
      console.log('- Inserting sample applicants...');
      await connection.query(INSERT_SAMPLE_APPLICANTS);
      
      console.log('- Inserting sample feedback...');
      await connection.query(INSERT_SAMPLE_FEEDBACK);
      
      console.log('- Inserting sample interviews...');
      await connection.query(INSERT_SAMPLE_INTERVIEWS);
      
      console.log('Sample data inserted successfully');
    } else {
      console.log(`Tables already contain data (found ${rows[0].count} applicants), skipping sample data insertion`);
    }
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('You can now run the server with: npm run dev');
  } catch (error) {
    console.error('\n❌ Error initializing database:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute the initialization function
initDb();

module.exports = initDb; 