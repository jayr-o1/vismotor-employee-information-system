const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get users data
    const [users] = await connection.query('SELECT id, name, email, role, is_verified FROM users');
    console.log('Users in database:');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach(user => {
        console.log(`- ${user.id}: ${user.name} (${user.email}) - Role: ${user.role} - Verified: ${user.is_verified ? 'Yes' : 'No'}`);
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers(); 