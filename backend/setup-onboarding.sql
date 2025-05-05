-- Use the vismotordb database
USE vismotordb;

-- Create onboarding_checklists table
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
);

-- Create onboarding_templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  days_to_complete INT DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add sample templates if table is empty
INSERT INTO onboarding_templates (title, description, priority, days_to_complete)
SELECT * FROM (
  SELECT 'Submit ID Documentation', 'Provide government-issued identification for verification', 'High', 3 UNION
  SELECT 'Complete Tax Forms', 'Fill out required tax documentation', 'High', 5 UNION
  SELECT 'Provide Bank Details', 'Submit bank account information for payroll processing', 'High', 3 UNION
  SELECT 'Sign Employment Contract', 'Review and sign employment agreement', 'High', 2 UNION
  SELECT 'Attend Orientation', 'Complete company orientation session', 'Medium', 7 UNION
  SELECT 'Meet Department Team', 'Introduction to your team and department', 'Medium', 5 UNION
  SELECT 'Set Up Accounts', 'Configure email and necessary system access', 'High', 2 UNION
  SELECT 'Complete Compliance Training', 'Finish required compliance training modules', 'Medium', 14 UNION
  SELECT 'Review Company Policies', 'Read and acknowledge company policies and handbook', 'Medium', 7
) AS tmp
WHERE NOT EXISTS (SELECT id FROM onboarding_templates LIMIT 1);

-- Show the newly created tables
SHOW TABLES LIKE 'onboarding%'; 