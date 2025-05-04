-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vismotordb;
USE vismotordb;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  reset_token VARCHAR(100),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create main applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  other_gender VARCHAR(50),
  age INT,
  marital_status VARCHAR(20),
  other_marital_status VARCHAR(50),
  highest_education VARCHAR(50),
  other_highest_education VARCHAR(100),
  region VARCHAR(50),
  province VARCHAR(50),
  city VARCHAR(50),
  barangay VARCHAR(50),
  street_address TEXT,
  position VARCHAR(100) NOT NULL,
  other_position VARCHAR(100),
  branch_department VARCHAR(50),
  other_branch_department VARCHAR(100),
  date_availability VARCHAR(50),
  other_date_availability VARCHAR(100),
  desired_pay DECIMAL(10,2),
  job_post_source VARCHAR(50),
  other_job_source VARCHAR(100),
  previously_employed BOOLEAN DEFAULT FALSE,
  resume_filename VARCHAR(255),
  resume_originalname VARCHAR(255),
  resume_path TEXT,
  house_sketch_filename VARCHAR(255),
  house_sketch_originalname VARCHAR(255),
  house_sketch_path TEXT,
  status ENUM('Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Accepted', 'Onboarded') DEFAULT 'Pending',
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table 
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  created_by VARCHAR(100) DEFAULT 'HR Team',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  location VARCHAR(255),
  interviewer VARCHAR(100),
  status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Create employees table for onboarded applicants
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