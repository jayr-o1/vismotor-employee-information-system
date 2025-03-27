const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkUsersTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check table structure
    const [columns] = await connection.query('DESCRIBE users');
    console.log('Structure of users table:');
    columns.forEach(column => {
      console.log(`- ${column.Field} (${column.Type})`);
    });
    
    // Check user data
    const [users] = await connection.query('SELECT * FROM users');
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      Object.entries(user).forEach(([key, value]) => {
        if (key !== 'password') { // Don't show password
          console.log(`  ${key}: ${value}`);
        } else {
          console.log(`  ${key}: [HIDDEN]`);
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsersTable(); 