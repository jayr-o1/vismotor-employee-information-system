const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkDatabases() {
  try {
    // Create connection without database name
    const { database, ...connectionConfig } = dbConfig;
    const connection = await mysql.createConnection(connectionConfig);
    
    // Get all databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('Databases on MySQL server:');
    databases.forEach(db => {
      const dbName = db.Database;
      console.log(`- ${dbName}${dbName === database ? ' (currently connected)' : ''}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabases(); 