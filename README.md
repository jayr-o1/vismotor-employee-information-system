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

### Recent Changes
- Consolidated database configuration to remove redundancy
- Moved SQL files to a dedicated folder for better organization
- Unified email configuration
- Improved database connection handling throughout the application
- Fixed inconsistent database access patterns
- Enhanced database initialization scripts with better error handling

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
