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

const INSERT_SAMPLE_FEEDBACK = `
INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES 
(1, 'Good technical skills but needs more experience with React.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'Excellent portfolio and strong design skills. Schedule for interview.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY))
`;

const INSERT_SAMPLE_INTERVIEWS = `
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY))
`;

async function createTables() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to database: ${dbConfig.database}`);
    
    // Create tables
    console.log('Creating applicants table...');
    await connection.query(CREATE_APPLICANTS_TABLE);
    
    console.log('Creating feedback table...');
    await connection.query(CREATE_FEEDBACK_TABLE);
    
    console.log('Creating interviews table...');
    await connection.query(CREATE_INTERVIEWS_TABLE);
    
    console.log('Creating employees table...');
    await connection.query(CREATE_EMPLOYEES_TABLE);
    
    // Check if applicants table is empty
    const [applicantCount] = await connection.query('SELECT COUNT(*) as count FROM applicants');
    
    // Insert sample data if table is empty
    if (applicantCount[0].count === 0) {
      console.log('Inserting sample applicants...');
      await connection.query(INSERT_SAMPLE_APPLICANTS);
      
      console.log('Inserting sample feedback...');
      await connection.query(INSERT_SAMPLE_FEEDBACK);
      
      console.log('Inserting sample interviews...');
      await connection.query(INSERT_SAMPLE_INTERVIEWS);
      
      console.log('Sample data inserted successfully.');
    } else {
      console.log('Applicants table already contains data. Skipping sample data insertion.');
    }
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nTables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
    console.log('\n✅ Tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTables(); 