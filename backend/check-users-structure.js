const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkUsersTable() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking users table structure...');
    const [rows] = await connection.query('DESCRIBE users');
    
    console.log('\nUsers Table Structure:');
    console.table(rows);
    
    await connection.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersTable(); 