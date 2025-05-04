-- Create equipment table for employee onboarding
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
);

-- Create documents table for employee onboarding
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
);

-- Create training table for employee onboarding
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
);

-- Equipment Types Table
CREATE TABLE IF NOT EXISTS equipment_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Document Types Table
CREATE TABLE IF NOT EXISTS document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT TRUE,
    days_to_submit INT DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Training Types Table
CREATE TABLE IF NOT EXISTS training_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample equipment types if not exists
INSERT INTO equipment_types (name, description) 
SELECT * FROM (
    SELECT 'Laptop', 'Standard company laptop with appropriate software' AS description UNION
    SELECT 'Monitor', '24-inch monitor for workstation' AS description UNION
    SELECT 'Mouse', 'Wireless ergonomic mouse' AS description UNION
    SELECT 'Keyboard', 'Ergonomic keyboard for desk use' AS description UNION
    SELECT 'Phone', 'Company mobile phone or desk phone' AS description UNION
    SELECT 'Headset', 'Noise-cancelling headset for calls' AS description UNION
    SELECT 'Office Chair', 'Ergonomic office chair' AS description UNION
    SELECT 'Standing Desk', 'Height-adjustable desk for ergonomic work' AS description
) AS tmp
WHERE NOT EXISTS (SELECT name FROM equipment_types LIMIT 1);

-- Insert sample document types if not exists
INSERT INTO document_types (name, description, required, days_to_submit) 
SELECT * FROM (
    SELECT 'ID Proof', 'Government-issued ID like passport or driver license', TRUE AS required, 3 AS days_to_submit UNION
    SELECT 'Bank Details', 'Bank account information for salary payment', TRUE, 7 UNION
    SELECT 'Tax Forms', 'Required tax documentation', TRUE, 7 UNION
    SELECT 'Employment Contract', 'Signed employment contract', TRUE, 1 UNION
    SELECT 'Education Certificates', 'Proof of education qualifications', TRUE, 14 UNION
    SELECT 'Work Reference', 'References from previous employers', FALSE, 14 UNION
    SELECT 'Background Check Consent', 'Consent for background verification', TRUE, 3 UNION
    SELECT 'Health Insurance Form', 'Form for health insurance enrollment', TRUE, 7
) AS tmp
WHERE NOT EXISTS (SELECT name FROM document_types LIMIT 1);

-- Insert sample training types if not exists
INSERT INTO training_types (name, description, duration_minutes) 
SELECT * FROM (
    SELECT 'Company Orientation', 'Introduction to company culture, values, and history', 120 AS duration_minutes UNION
    SELECT 'Health & Safety', 'Workplace health and safety procedures', 60 UNION
    SELECT 'IT Systems', 'Introduction to IT systems and security protocols', 90 UNION
    SELECT 'HR Policies', 'Overview of HR policies and procedures', 60 UNION
    SELECT 'Department Introduction', 'Specific department onboarding and introductions', 120 UNION
    SELECT 'Role-specific Training', 'Specialized training for specific job role', 180 UNION
    SELECT 'Customer Service', 'Customer service standards and procedures', 90 UNION
    SELECT 'Product Knowledge', 'Detailed training on company products and services', 120
) AS tmp
WHERE NOT EXISTS (SELECT name FROM training_types LIMIT 1); 