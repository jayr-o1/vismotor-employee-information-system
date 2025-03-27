-- Step 1: Create applicants table
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
);

-- Step 2: Create feedback table 
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  created_by VARCHAR(100) DEFAULT 'HR Team',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Step 3: Create interviews table
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
);

-- Step 4: Create employees table
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
);

-- Step 5: Sample data - Applicants
INSERT INTO applicants (name, email, phone, position, education, experience, skills, status, applied_date) VALUES 
('John Doe', 'john.doe@example.com', '123-456-7890', 'Web Developer', 'Bachelor in Computer Science', '5 years experience in web development', 'JavaScript, React, Node.js, MySQL', 'Pending', NOW()),
('Jane Smith', 'jane.smith@example.com', '987-654-3210', 'UI/UX Designer', 'Master in Design', '3 years experience in UI/UX design', 'Figma, Adobe XD, Photoshop, Illustrator', 'Reviewed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Mike Johnson', 'mike.johnson@example.com', '555-123-4567', 'Project Manager', 'MBA', '7 years experience in IT project management', 'Agile, Scrum, JIRA, Confluence', 'Scheduled', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Step 6: Sample data - Feedback  
INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES 
(2, 'Excellent portfolio and strong design skills. Schedule for interview.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Step 7: Sample data - Interviews
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY)); 