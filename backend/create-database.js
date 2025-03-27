const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function createDatabase() {
  let connection;
  try {
    // Connect without database name
    const { database, ...connectionConfig } = dbConfig;
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(connectionConfig);
    
    // Create database
    console.log(`Creating database '${database}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    console.log(`Database '${database}' created or already exists.`);
    
    // Show all databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nAll databases on server:');
    databases.forEach(db => console.log(`- ${db.Database}`));
    
    // Connect to the database to verify
    await connection.end();
    console.log(`\nConnecting to database '${database}' to verify...`);
    connection = await mysql.createConnection(dbConfig);
    console.log(`Successfully connected to '${database}'!`);
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nTables in database:');
    if (tables.length === 0) {
      console.log('No tables found. You should run the setup script next.');
      console.log('Run: node src/configs/setup-db.js');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`- ${tableName}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabase(); 