const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// Sample data insertion SQL statements
const INSERT_SAMPLE_APPLICANTS = `
INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES 
('John Doe', 'john.doe@example.com', '123-456-7890', 'Web Developer', 'Bachelor in Computer Science', '5 years experience in web development', 'JavaScript, React, Node.js, MySQL', 'Pending', NOW()),
('Jane Smith', 'jane.smith@example.com', '987-654-3210', 'UI/UX Designer', 'Master in Design', '3 years experience in UI/UX design', 'Figma, Adobe XD, Photoshop, Illustrator', 'Reviewed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Mike Johnson', 'mike.johnson@example.com', '555-123-4567', 'Project Manager', 'MBA', '7 years experience in IT project management', 'Agile, Scrum, JIRA, Confluence', 'Scheduled', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Sarah Williams', 'sarah.williams@example.com', '222-333-4444', 'Data Analyst', 'Bachelor in Statistics', '4 years experience in data analysis', 'Python, R, SQL, Tableau, Power BI', 'Reviewed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Alex Brown', 'alex.brown@example.com', '111-222-3333', 'Mobile Developer', 'Bachelor in Software Engineering', '2 years experience in mobile development', 'Swift, Kotlin, React Native, Flutter', 'Pending', NOW())
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
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'Strong analytical skills and good understanding of data visualization tools.', 'Data Team Lead', DATE_SUB(NOW(), INTERVAL 1 DAY))
`;

const INSERT_SAMPLE_INTERVIEWS = `
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:15:00', 'Conference Room B', 'Data Science Director', 'Scheduled', DATE_SUB(NOW(), INTERVAL 1 DAY))
`;

const INSERT_SAMPLE_EMPLOYEES = `
INSERT INTO employees (applicant_id, name, email, phone, position, department, hire_date, salary, status) VALUES 
(NULL, 'James Wilson', 'james.wilson@example.com', '555-987-6543', 'Senior Developer', 'IT', '2023-01-15', 85000.00, 'Active'),
(NULL, 'Emma Davis', 'emma.davis@example.com', '555-555-5555', 'HR Specialist', 'Human Resources', '2023-03-10', 65000.00, 'Active'),
(NULL, 'Robert Miller', 'robert.miller@example.com', '555-444-3333', 'Finance Manager', 'Finance', '2022-11-20', 90000.00, 'Active'),
(NULL, 'Olivia Garcia', 'olivia.garcia@example.com', '555-123-9876', 'Marketing Specialist', 'Marketing', '2023-06-01', 67000.00, 'On Leave')
`;

async function addSampleData() {
  let connection;
  
  try {
    // Connect to the database
    console.log(`Connecting to database '${dbConfig.database}'...`);
    connection = await mysql.createConnection(dbConfig);
    
    // Check if tables exist
    console.log('Checking if tables exist...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => table[`Tables_in_${dbConfig.database}`]);
    
    const requiredTables = ['applicants', 'users', 'feedback', 'interviews', 'employees'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.error(`\n❌ Error: The following tables are missing: ${missingTables.join(', ')}`);
      console.error('Please run init-database.js first to create the required tables.');
      return;
    }
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Check if tables are empty before inserting data
    const checkTableEmpty = async (tableName) => {
      const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      return result[0].count === 0;
    };
    
    // Insert sample applicants
    if (await checkTableEmpty('applicants')) {
      console.log('- Inserting sample applicants...');
      await connection.query(INSERT_SAMPLE_APPLICANTS);
    } else {
      console.log('- Skipping applicants insertion (table already has data)');
    }
    
    // Insert sample users
    if (await checkTableEmpty('users')) {
      console.log('- Inserting sample users...');
      await connection.query(INSERT_SAMPLE_USERS);
    } else {
      console.log('- Skipping users insertion (table already has data)');
    }
    
    // Insert sample feedback
    if (await checkTableEmpty('feedback')) {
      console.log('- Inserting sample feedback...');
      await connection.query(INSERT_SAMPLE_FEEDBACK);
    } else {
      console.log('- Skipping feedback insertion (table already has data)');
    }
    
    // Insert sample interviews
    if (await checkTableEmpty('interviews')) {
      console.log('- Inserting sample interviews...');
      await connection.query(INSERT_SAMPLE_INTERVIEWS);
    } else {
      console.log('- Skipping interviews insertion (table already has data)');
    }
    
    // Insert sample employees
    if (await checkTableEmpty('employees')) {
      console.log('- Inserting sample employees...');
      await connection.query(INSERT_SAMPLE_EMPLOYEES);
    } else {
      console.log('- Skipping employees insertion (table already has data)');
    }
    
    // Verify data
    console.log('\nVerifying sample data:');
    const [applicants] = await connection.query('SELECT COUNT(*) as count FROM applicants');
    console.log(`- Applicants count: ${applicants[0].count}`);
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`- Users count: ${users[0].count}`);
    
    const [feedback] = await connection.query('SELECT COUNT(*) as count FROM feedback');
    console.log(`- Feedback count: ${feedback[0].count}`);
    
    const [interviews] = await connection.query('SELECT COUNT(*) as count FROM interviews');
    console.log(`- Interviews count: ${interviews[0].count}`);
    
    const [employees] = await connection.query('SELECT COUNT(*) as count FROM employees');
    console.log(`- Employees count: ${employees[0].count}`);
    
    console.log('\n✅ Sample data added successfully!');
    
  } catch (error) {
    console.error('\n❌ Error adding sample data:', error);
    console.error('Please ensure MySQL is running and the connection details are correct.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  addSampleData();
} else {
  // Export the function for use in other scripts
  module.exports = addSampleData;
} 