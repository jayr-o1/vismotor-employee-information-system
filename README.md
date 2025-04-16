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

4. Set up the database:
   ```
   npm run setup-database
   ```

5. (Optional) Load sample data:
   ```
   npm run setup-sample-data
   ```

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
