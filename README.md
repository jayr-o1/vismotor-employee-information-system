# Vismotor Employee Information System

A comprehensive web application for managing employee and applicant information.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_DATABASE=vismotordb
   
   # Email configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   ```

### Database Setup
1. Ensure your MySQL server is running:
   ```
   # Windows (if installed as a service)
   net start mysql

   # Linux
   sudo systemctl start mysql
   ```

2. Set up database and tables:
   ```
   npm run setup-database
   ```
   
   This script will:
   - Create the vismotordb database if it doesn't exist
   - Create all required tables with appropriate relationships
   - Set up proper relationships between tables including foreign keys
   - Configure appropriate indexes for optimal performance
   - Load sample data for testing

   The updated setup uses consolidated SQL files in the `backend/src/configs/sql` folder:
   - `schema.sql`: Contains database and table creation statements
   - `sample-data.sql`: Contains sample data for testing
   
3. Database tables overview:
   - `users`: System users with authentication details and role-based permissions
   - `employees`: Employee records with personal and professional information  
   - `applicants`: Job applicant information and application status tracking
   - `feedback`: Feedback entries for applicants during the hiring process
   - `interviews`: Interview scheduling and status tracking
   - `applicant_notes`: Additional notes for applicants

4. Verify database setup:
   You can verify the tables were created correctly by running:
   ```
   npm run check-db
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. In the root directory, create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Features
- Employee management
- Applicant tracking system
- User authentication and authorization
- Dark/Light theme support

## Technologies Used
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express
- Database: MySQL

## Project Structure
The project has been reorganized for better maintainability:

### Backend Structure
```
backend/
├── server.js              # Main entry point
├── src/
│   ├── configs/           # Configuration files
│   │   ├── database.js    # Unified database configuration
│   │   ├── email.js       # Email service configuration
│   │   ├── jwt.js         # JWT authentication configuration
│   │   └── sql/           # SQL files for database setup
│   │       ├── schema.sql       # Database and table creation
│   │       └── sample-data.sql  # Sample data for testing
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
```

## API Documentation

### Authentication Endpoints

#### Login
- **URL**: `/api/login`
- **Method**: `POST`
- **SQL Query**: `SELECT * FROM users WHERE email = ?`
- **Sample Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT token and user information

#### Signup
- **URL**: `/api/signup`
- **Method**: `POST`
- **SQL Query**: `INSERT INTO users (name, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)`
- **Sample Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "hr_staff"
  }
  ```

#### Forgot Password
- **URL**: `/api/forgot-password`
- **Method**: `POST`
- **SQL Query**: `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`
- **Sample Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Reset Password
- **URL**: `/api/reset-password`
- **Method**: `POST`
- **SQL Query**: `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?`
- **Sample Request Body**:
  ```json
  {
    "token": "reset-token-string",
    "password": "newpassword123"
  }
  ```

### Applicant Endpoints

#### Get All Applicants
- **URL**: `/api/applicants`
- **Method**: `GET`
- **SQL Query**: `SELECT * FROM applicants ORDER BY applied_date DESC`

#### Get Applicant by ID
- **URL**: `/api/applicants/:id`
- **Method**: `GET`
- **SQL Query**: `SELECT * FROM applicants WHERE id = ?`

#### Create Applicant
- **URL**: `/api/applicants`
- **Method**: `POST`
- **SQL Query**: `INSERT INTO applicants (first_name, last_name, email, gender, position, highest_education, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`
- **Sample Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "gender": "Male",
    "position": "Software Developer",
    "highestEducation": "Bachelor's Degree"
  }
  ```

#### Update Applicant
- **URL**: `/api/applicants/:id`
- **Method**: `PUT`
- **SQL Query**: `UPDATE applicants SET first_name = ?, last_name = ?, email = ?, gender = ?, position = ?, highest_education = ?, status = ? WHERE id = ?`
- **Sample Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "gender": "Male",
    "position": "Senior Software Developer",
    "highestEducation": "Master's Degree",
    "status": "Reviewed"
  }
  ```

#### Update Applicant Status
- **URL**: `/api/applicants/:id/status`
- **Method**: `PATCH`
- **SQL Query**: `UPDATE applicants SET status = ? WHERE id = ?`
- **Sample Request Body**:
  ```json
  {
    "status": "Interviewed"
  }
  ```

#### Delete Applicant
- **URL**: `/api/applicants/:id`
- **Method**: `DELETE`
- **SQL Queries**:
  ```sql
  DELETE FROM feedback WHERE applicant_id = ?
  DELETE FROM interviews WHERE applicant_id = ?
  DELETE FROM applicants WHERE id = ?
  ```

#### Submit Application Form
- **URL**: `/applications/submit`
- **Method**: `POST`
- **SQL Query**: 
  ```sql
  INSERT INTO applicants (
    email, first_name, last_name, gender, other_gender, age, 
    marital_status, other_marital_status, highest_education, other_highest_education,
    region, province, city, barangay, street_address,
    position, other_position, branch_department, other_branch_department,
    date_availability, other_date_availability, desired_pay,
    job_post_source, other_job_source, previously_employed,
    resume_filename, resume_originalname, resume_path,
    house_sketch_filename, house_sketch_originalname, house_sketch_path,
    status, applied_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  ```
- **Sample Request Body**:
  ```json
  {
    "email": "applicant@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "otherGender": "",
    "age": 28,
    "maritalStatus": "Single",
    "otherMaritalStatus": "",
    "highestEducation": "Bachelor's Degree",
    "otherHighestEducation": "",
    "region": "Western Visayas",
    "province": "Negros Occidental",
    "city": "Bacolod City",
    "barangay": "Mandalagan",
    "streetAddress": "123 Main Street",
    "positionApplyingFor": "Software Developer",
    "otherPosition": "",
    "branchDepartment": "IT Department",
    "otherBranchDepartment": "",
    "dateAvailability": "Immediate",
    "otherDateAvailability": "",
    "desiredPay": 25000,
    "jobPostSource": "Online Job Portal",
    "otherJobSource": "",
    "previouslyEmployed": false,
    "resumeFile": {
      "filename": "resume-12345.pdf",
      "originalname": "john_doe_resume.pdf",
      "path": "/uploads/resume-12345.pdf"
    },
    "houseSketchFile": {
      "filename": "sketch-67890.jpg",
      "originalname": "house_sketch.jpg",
      "path": "/uploads/sketch-67890.jpg"
    }
  }
  ```

#### Upload Files
- **URL**: `/applications/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `resumeFile`: PDF or Word document (max 10MB)
  - `houseSketchFile`: JPG, PNG, or PDF (max 10MB)

### Feedback Endpoints

#### Get All Feedback for an Applicant
- **URL**: `/api/applicants/:id/feedback`
- **Method**: `GET`
- **SQL Query**: `SELECT * FROM feedback WHERE applicant_id = ? ORDER BY created_at DESC`

#### Add Feedback for an Applicant
- **URL**: `/api/applicants/:id/feedback`
- **Method**: `POST`
- **SQL Queries**:
  ```sql
  INSERT INTO feedback (applicant_id, feedback_text, created_by, created_at) VALUES (?, ?, ?, NOW())
  UPDATE applicants SET status = 'Reviewed' WHERE id = ? AND status = 'Pending'
  ```
- **Sample Request Body**:
  ```json
  {
    "feedback_text": "Candidate has strong technical skills but limited experience.",
    "created_by": "Jane Smith"
  }
  ```

#### Update Feedback
- **URL**: `/api/feedback/:id`
- **Method**: `PUT`
- **SQL Query**: `UPDATE feedback SET feedback_text = ?, updated_at = NOW() WHERE id = ?`
- **Sample Request Body**:
  ```json
  {
    "feedback_text": "Candidate has excellent technical skills and shows great potential."
  }
  ```

#### Delete Feedback
- **URL**: `/api/feedback/:id`
- **Method**: `DELETE`
- **SQL Query**: `DELETE FROM feedback WHERE id = ?`

### Interview Endpoints

#### Get All Interviews
- **URL**: `/api/interviews`
- **Method**: `GET`
- **SQL Query**: 
  ```sql
  SELECT i.*, a.name as applicant_name, a.position as applicant_position
  FROM interviews i
  JOIN applicants a ON i.applicant_id = a.id
  ORDER BY i.interview_date DESC, i.interview_time DESC
  ```

#### Schedule an Interview
- **URL**: `/api/applicants/:id/interviews`
- **Method**: `POST`
- **SQL Query**: `INSERT INTO interviews (applicant_id, interview_date, interview_time, location, interviewer, status, notes, created_at) VALUES (?, ?, ?, ?, ?, 'Scheduled', ?, NOW())`
- **Sample Request Body**:
  ```json
  {
    "interview_date": "2023-09-15",
    "interview_time": "14:30:00",
    "location": "Bacolod Office - Conference Room 2",
    "interviewer": "Jane Smith",
    "notes": "Technical interview for software developer position"
  }
  ```

### Employee Endpoints

#### Get All Employees
- **URL**: `/api/employees`
- **Method**: `GET`
- **SQL Query**: `SELECT * FROM employees ORDER BY hire_date DESC`

#### Get Employee by ID
- **URL**: `/api/employees/:id`
- **Method**: `GET`
- **SQL Query**: `SELECT * FROM employees WHERE id = ?`

#### Update Employee
- **URL**: `/api/employees/:id`
- **Method**: `PUT`
- **SQL Query**: 
  ```sql
  UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, department = ?, status = ?, profile_picture = ?, hire_date = ?, salary = ? WHERE id = ?
  ```
- **Sample Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@vismotor.com",
    "phone": "+639123456789",
    "position": "Senior Software Developer",
    "department": "IT Department",
    "status": "Active",
    "profile_picture": "/uploads/profile-pictures/profile-12345.jpg",
    "hire_date": "2023-01-15",
    "salary": 35000
  }
  ```

#### Upload Profile Picture
- **URL**: `/api/employees/:id/profile-picture`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `profilePicture`: Image file (jpg, jpeg, png, gif) (max 5MB)

### User Management Endpoints

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **SQL Query**: `SELECT id, name, email, role, is_verified, created_at FROM users`

#### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **SQL Query**: `INSERT INTO users (name, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)`
- **Sample Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@vismotor.com",
    "password": "securepassword",
    "role": "hr_admin"
  }
  ```

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **SQL Query**: `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`
- **Sample Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@vismotor.com",
    "role": "it_admin"
  }
  ```

#### Update User Password
- **URL**: `/api/users/:id/password`
- **Method**: `PATCH`
- **SQL Query**: `UPDATE users SET password = ? WHERE id = ?`
- **Sample Request Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

## Database Schema

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('it_admin', 'hr_admin', 'hr_staff') DEFAULT 'hr_staff',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  reset_token VARCHAR(100),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Applicants Table
```sql
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
```

### Feedback Table
```sql
CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  applicant_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  created_by VARCHAR(100) DEFAULT 'HR Team',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);
```

### Interviews Table
```sql
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
```

### Employees Table
```sql
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
```

## Running Database Setup
To set up the database, simply run:
```
cd backend
npm run setup-database
```

This command executes the `create-tables.js` script which:
1. Creates the database if it doesn't exist
2. Drops any existing tables (with foreign key checks disabled)
3. Creates all tables based on the schema.sql file
4. Populates tables with sample data from sample-data.sql
5. Verifies the setup was successful
