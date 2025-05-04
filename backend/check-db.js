const mysql = require('mysql2/promise');
const db = require('./src/configs/database');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection(db.config);
    console.log('Connected to database:', db.config.database);
    
    // List all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
    // Check each table's structure
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`\nStructure of table '${tableName}':`);
      columns.forEach(column => {
        console.log(`  ${column.Field} (${column.Type})`);
      });
      
      // Count rows
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  Row count: ${count[0].count}`);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase(); 