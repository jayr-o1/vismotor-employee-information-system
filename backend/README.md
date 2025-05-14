# Vismotor Employee Information System - Backend

## Database Setup with Knex.js Migrations

This project uses Knex.js for database migrations, providing a structured approach to database schema changes.

### Prerequisites

- Node.js and npm
- MySQL server installed and running
- Proper environment variables set in `.env` file

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=vismotordb

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run database migrations to create all tables:

```bash
npm run migrate
```

3. Seed the database with initial data (optional):

```bash
npm run seed
```

4. Start the server:

```bash
npm run dev
```

### Migration Commands

- Run all pending migrations: `npm run migrate`
- Rollback the last batch of migrations: `npm run migrate:rollback`
- Create a new migration file: `npm run migrate:make your_migration_name`
- Create a new seed file: `npm run seed:make your_seed_name`
- Run seed files: `npm run seed`

### Project Structure

```
backend/
├── src/
│   ├── database/           # Database related files
│   │   ├── migrations/     # Database migrations
│   │   └── seeds/          # Database seed files
│   ├── models/             # Database models
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── utils/              # Utility functions
├── uploads/                # Uploaded files
├── .env                    # Environment variables
├── knexfile.js             # Knex configuration
├── package.json            # Node.js dependencies
└── server.js               # Main application entry point
```

### Migration Benefits

- Version control for database schema
- Ability to roll back to a previous state
- Consistent database structure across environments
- Team collaboration on database changes
- Automated tracking of applied migrations 