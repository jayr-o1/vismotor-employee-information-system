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

2. Create the database:
   ```
   mysql -u root -p
   ```
   
   Then in the MySQL prompt:
   ```sql
   CREATE DATABASE vismotordb;
   EXIT;
   ```

3. Set up database tables:
   ```
   npm run setup-database
   ```
   This script will create all necessary tables with their relationships.

4. (Optional) Load sample data:
   ```
   npm run setup-sample-data
   ```

5. Database schema overview:
   - `users`: System users with authentication details
   - `employees`: Employee records with personal and professional information  
   - `applicants`: Job applicant information and application status
   - `departments`: Company departments and hierarchical structure
   - `positions`: Job positions and their requirements
   - `documents`: Employee and applicant document storage

6. Start the backend server:
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
