const mysql = require('mysql2/promise');
const dbConfig = require('./src/configs/database');

async function checkVismotorDB() {
  let connection;
  try {
    // Modify config to use vismotordb
    const config = {
      ...dbConfig,
      database: 'vismotordb'
    };
    
    console.log('Connecting to vismotordb...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');
    
    // List all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in vismotordb:');
    
    if (tables.length === 0) {
      console.log('No tables found in vismotordb.');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`- ${tableName}`);
      });
      
      // Check each table's structure and count
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        try {
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`  ${tableName} has ${count[0].count} rows`);
        } catch (err) {
          console.log(`  Error counting rows in ${tableName}: ${err.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkVismotorDB(); 