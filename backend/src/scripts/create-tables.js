const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/database').config;
require('dotenv').config();

// Update paths to SQL files
const schemaFile = path.join(__dirname, '../config/sql/schema.sql');
const sampleDataFile = path.join(__dirname, '../config/sql/sample-data.sql');

// Read SQL files
const schemaContent = fs.readFileSync(schemaFile, 'utf8');
const sampleDataContent = fs.readFileSync(sampleDataFile, 'utf8');

// Combine schema and sample data
const sqlContent = schemaContent + '\n' + sampleDataContent;

// Split the SQL content into individual statements
const sqlStatements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0 && !statement.startsWith('--'));

async function executeSql() {
  let connection;
  
  try {
    // First check if database exists, if not create it
    const { database, ...connectionConfig } = dbConfig;
    console.log('Connecting to MySQL...');
    
    connection = await mysql.createConnection(connectionConfig);
    console.log(`Creating database ${database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    await connection.end();
    
    // Connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to database: ${database}`);

    // Drop existing tables if they exist (in reverse order due to foreign key constraints)
    console.log('Dropping existing tables if they exist...');
    
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Drop the tables that were highlighted in the image
      await connection.query('DROP TABLE IF EXISTS employee_documents');
      await connection.query('DROP TABLE IF EXISTS employee_equipment');
      await connection.query('DROP TABLE IF EXISTS employee_training');
      await connection.query('DROP TABLE IF EXISTS document_types');
      await connection.query('DROP TABLE IF EXISTS equipment_types');
      await connection.query('DROP TABLE IF EXISTS training_types');
      
      // Keep other tables
      await connection.query('DROP TABLE IF EXISTS employees');
      await connection.query('DROP TABLE IF EXISTS interviews');
      await connection.query('DROP TABLE IF EXISTS feedback');
      await connection.query('DROP TABLE IF EXISTS applicant_notes');
      await connection.query('DROP TABLE IF EXISTS applicants');
      await connection.query('DROP TABLE IF EXISTS users');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Tables dropped successfully.');
    } catch (error) {
      console.error('Error dropping tables:', error.message);
    }
    
    // Execute each SQL statement sequentially
    console.log('Creating tables and inserting sample data...');
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      
      try {
        console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
        await connection.query(statement);
        console.log(`Statement ${i + 1} executed successfully.`);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        console.error('SQL statement:', statement);
        throw error; // Stop execution if any statement fails
      }
    }
    
    console.log('All statements executed successfully!');
    
    // Verify tables were created
    console.log('Verifying tables were created...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${database}`];
      console.log(`- ${tableName}`);
    });
    
    // Check sample data
    console.log('\nVerifying sample data...');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users count: ${users[0].count}`);
    
    const [applicants] = await connection.query('SELECT COUNT(*) as count FROM applicants');
    console.log(`Applicants count: ${applicants[0].count}`);
    
    const [feedback] = await connection.query('SELECT COUNT(*) as count FROM feedback');
    console.log(`Feedback count: ${feedback[0].count}`);
    
    const [interviews] = await connection.query('SELECT COUNT(*) as count FROM interviews');
    console.log(`Interviews count: ${interviews[0].count}`);
    
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      console.log('Closing database connection...');
      await connection.end();
    }
  }
}

executeSql(); 