const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function dropTables() {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'vismotordb'
    });
    
    console.log('Connected to database successfully!');
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop the highlighted tables in the correct order to avoid dependency issues
    console.log('Dropping tables...');
    
    // First drop tables that have foreign key references to other tables
    console.log('- Dropping employee_documents table...');
    await connection.query('DROP TABLE IF EXISTS employee_documents');
    
    console.log('- Dropping employee_equipment table...');
    await connection.query('DROP TABLE IF EXISTS employee_equipment');
    
    console.log('- Dropping employee_training table...');
    await connection.query('DROP TABLE IF EXISTS employee_training');
    
    // Then drop the reference tables
    console.log('- Dropping document_types table...');
    await connection.query('DROP TABLE IF EXISTS document_types');
    
    console.log('- Dropping equipment_types table...');
    await connection.query('DROP TABLE IF EXISTS equipment_types');
    
    console.log('- Dropping training_types table...');
    await connection.query('DROP TABLE IF EXISTS training_types');
    
    console.log('Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // List remaining tables
    console.log('\nRemaining tables in database:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = table[Object.keys(table)[0]];
      console.log(`- ${tableName}`);
    });
    
    console.log('\n✅ Tables dropped successfully!');
    
  } catch (error) {
    console.error('\n❌ Error dropping tables:', error);
  } finally {
    if (connection) {
      console.log('Closing database connection...');
      await connection.end();
    }
  }
}

// Execute the function
dropTables(); 