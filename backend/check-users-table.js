const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkUsersTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');
    
    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('Users table does not exist!');
      return;
    }
    
    // Get table structure
    const [columns] = await connection.query('DESCRIBE users');
    console.log('Users table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Get row count
    const [count] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`\nNumber of rows in users table: ${count[0].count}`);
    
    // Get sample rows
    if (count[0].count > 0) {
      const [rows] = await connection.query('SELECT * FROM users LIMIT 3');
      console.log('\nSample rows:');
      rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      });
    }
  } catch (error) {
    console.error('Error checking users table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsersTable(); 