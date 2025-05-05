const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // Load environment variables
const dbConfig = require('./src/configs/database');

async function setupOnboarding() {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    // Create onboarding tables
    console.log('Creating onboarding tables...');
    
    // Create the onboarding_checklists table
    console.log('- Creating onboarding_checklists table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS onboarding_checklists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_date DATE DEFAULT NULL,
        due_date DATE,
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    
    // Create the onboarding_templates table
    console.log('- Creating onboarding_templates table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS onboarding_templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        days_to_complete INT DEFAULT 7,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Check if templates exist
    console.log('- Checking for existing templates...');
    const [templateCount] = await connection.query("SELECT COUNT(*) as count FROM onboarding_templates");
    console.log(`  Found ${templateCount[0].count} templates`);
    
    if (templateCount[0].count === 0) {
      console.log('- Adding sample onboarding templates...');
      try {
        // Load SQL file
        const sqlFile = path.join(__dirname, 'src', 'configs', 'sql', 'onboarding_checklist.sql');
        const sql = await fs.readFile(sqlFile, 'utf8');
        
        // Extract just the INSERT statement for templates
        const insertPattern = /INSERT INTO onboarding_templates[\s\S]+?;/;
        const match = sql.match(insertPattern);
        
        if (match && match[0]) {
          await connection.query(match[0]);
          console.log('  ✓ Sample templates inserted successfully!');
        } else {
          console.log('  ✗ Could not find INSERT statement for templates in SQL file');
          
          // Fallback - add basic templates directly
          console.log('  ⚠ Adding basic templates directly...');
          await connection.query(`
            INSERT INTO onboarding_templates 
            (title, description, priority, days_to_complete) VALUES
            ('Submit ID Documentation', 'Provide government-issued identification for verification', 'High', 3),
            ('Complete Tax Forms', 'Fill out required tax documentation', 'High', 5),
            ('Provide Bank Details', 'Submit bank account information for payroll processing', 'High', 3),
            ('Sign Employment Contract', 'Review and sign employment agreement', 'High', 2),
            ('Attend Orientation', 'Complete company orientation session', 'Medium', 7)
          `);
          console.log('  ✓ Basic templates added successfully!');
        }
      } catch (error) {
        console.error('  ✗ Error adding sample templates:', error.message);
      }
    } else {
      console.log('  ✓ Templates already exist, skipping...');
    }
    
    // Show final tables
    console.log('Final onboarding tables in the database:');
    const [tables] = await connection.query("SHOW TABLES LIKE 'onboarding%'");
    tables.forEach(table => {
      console.log(`- ${table['Tables_in_' + dbConfig.database + ' (onboarding%)']}`);
    });
    
    console.log('\n✅ Onboarding setup complete!');
  } catch (error) {
    console.error('\n❌ Error setting up onboarding tables:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the setup
setupOnboarding(); 