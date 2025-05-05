const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables

// Parse command line arguments
const args = process.argv.slice(2);
const dbHost = args[0] || process.env.DB_HOST || 'localhost';
const dbUser = args[1] || process.env.DB_USER || 'root';
const dbPassword = args[2] || process.env.DB_PASSWORD || '';
const dbName = args[3] || process.env.DB_NAME || 'vismotordb';

console.log('Using the following database configuration:');
console.log(`Host: ${dbHost}`);
console.log(`User: ${dbUser}`);
console.log(`Database: ${dbName}`);
console.log('Password: [HIDDEN]');

async function dropOnboardingTables() {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    // Create connection using provided credentials
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    console.log('Connected to database successfully!');
    
    // Disable foreign key checks temporarily
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop the onboarding tables
    console.log('Dropping onboarding tables...');
    
    console.log('- Dropping onboarding_checklists table...');
    await connection.query('DROP TABLE IF EXISTS onboarding_checklists');
    
    console.log('- Dropping onboarding_templates table...');
    await connection.query('DROP TABLE IF EXISTS onboarding_templates');
    
    // Re-enable foreign key checks
    console.log('Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Show remaining tables
    console.log('\nRemaining tables in database:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = table[Object.keys(table)[0]];
      console.log(`- ${tableName}`);
    });
    
    console.log('\n✅ Onboarding tables dropped successfully!');
    
  } catch (error) {
    console.error('\n❌ Error dropping onboarding tables:', error);
    console.log('\nUsage: node drop-onboarding-tables.js [host] [user] [password] [database]');
    console.log('Example: node drop-onboarding-tables.js localhost root mypassword vismotordb');
  } finally {
    if (connection) {
      console.log('Closing database connection...');
      await connection.end();
    }
  }
}

// Execute the function
dropOnboardingTables(); 