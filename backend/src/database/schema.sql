-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(255) NOT NULL,
    education TEXT,
    experience TEXT,
    skills TEXT,
    status ENUM('Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Accepted', 'Onboarded') DEFAULT 'Pending',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applicant_notes table
CREATE TABLE IF NOT EXISTS applicant_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL,
    feedback_text TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    interviewer VARCHAR(255) NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
); 