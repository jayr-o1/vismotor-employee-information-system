-- Sample data for Vismotor Employee Information System

-- Sample users 
INSERT INTO users (name, email, password, role, is_verified) VALUES 
('Admin User', 'admin@vismotor.com', '$2a$10$zFj1T8D2pU3.hK6arb0M8uOYGUveKKS7Y.hXOeYLQS4KDXbUEYRae', 'admin', 1), -- password: admin1234
('HR Manager', 'hr@vismotor.com', '$2a$10$zFj1T8D2pU3.hK6arb0M8uOYGUveKKS7Y.hXOeYLQS4KDXbUEYRae', 'manager', 1), -- password: admin1234
('Regular User', 'user@vismotor.com', '$2a$10$zFj1T8D2pU3.hK6arb0M8uOYGUveKKS7Y.hXOeYLQS4KDXbUEYRae', 'user', 1); -- password: admin1234

-- Sample applicants (simplified format for demonstration)
INSERT INTO applicants (first_name, last_name, email, gender, position, highest_education, status, applied_date) VALUES 
('John', 'Doe', 'john.doe@example.com', 'Male', 'Web Developer', 'Bachelor\'s Degree', 'Pending', NOW()),
('Jane', 'Smith', 'jane.smith@example.com', 'Female', 'UI/UX Designer', 'Master\'s Degree', 'Reviewed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Mike', 'Johnson', 'mike.johnson@example.com', 'Male', 'Project Manager', 'MBA', 'Interviewed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Sarah', 'Williams', 'sarah.williams@example.com', 'Female', 'Software Engineer', 'Bachelor\'s Degree', 'Accepted', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('David', 'Brown', 'david.brown@example.com', 'Male', 'Network Administrator', 'Associate\'s Degree', 'Rejected', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Sample feedback
INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES 
(2, 'Excellent portfolio and strong design skills. Schedule for interview.', 'HR Manager', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Good experience and communication skills. Proceed to next round.', 'Department Head', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'Outstanding technical skills and cultural fit. Extending offer.', 'CTO', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 'Not enough experience for the position. Maybe consider for junior role.', 'IT Manager', DATE_SUB(NOW(), INTERVAL 13 DAY));

-- Sample interviews
INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, created_at) VALUES 
(2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', 'Online (Google Meet)', 'Design Team Lead', 'Scheduled', NOW()),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Conference Room A', 'CTO', 'Scheduled', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'Conference Room B', 'Engineering Manager', 'Completed', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Sample employees (onboarded applicants)
INSERT INTO employees (applicant_id, name, email, phone, position, department, hire_date, salary) VALUES 
(4, 'Sarah Williams', 'sarah.williams@example.com', '555-987-6543', 'Software Engineer', 'Engineering', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 75000.00); 