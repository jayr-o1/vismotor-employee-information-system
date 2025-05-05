const mysql = require('mysql2/promise');
require('dotenv').config();

// Load database config from .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'vismotordb'
};

console.log('Using database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  // Not logging password for security reasons
});

async function testOnboarding() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database!');
    
    // Check if the onboarding tables exist
    console.log('Checking for onboarding tables...');
    const [tables] = await connection.query('SHOW TABLES LIKE "onboarding%"');
    
    if (tables.length === 0) {
      console.log('No onboarding tables found. Creating them now...');
      
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
      
      // Insert some sample templates
      console.log('- Adding sample templates...');
      await connection.query(`
        INSERT INTO onboarding_templates (title, description, priority, days_to_complete) VALUES
        ('Submit ID Documentation', 'Provide government-issued identification for verification', 'High', 3),
        ('Complete Tax Forms', 'Fill out required tax documentation', 'High', 5),
        ('Provide Bank Details', 'Submit bank account information for payroll', 'High', 3),
        ('Sign Employment Contract', 'Review and sign employment agreement', 'High', 2),
        ('Attend Orientation', 'Complete company orientation session', 'Medium', 7)
      `);
    } else {
      console.log(`Found ${tables.length} onboarding tables:`);
      tables.forEach(table => {
        console.log(`- ${table[Object.keys(table)[0]]}`);
      });
    }
    
    // Check for templates
    console.log('\nChecking for templates...');
    const [templateCount] = await connection.query('SELECT COUNT(*) as count FROM onboarding_templates');
    console.log(`Found ${templateCount[0].count} templates`);
    
    if (templateCount[0].count > 0) {
      const [templates] = await connection.query('SELECT title, priority FROM onboarding_templates LIMIT 5');
      console.log('Sample templates:');
      templates.forEach(template => {
        console.log(`- ${template.title} (Priority: ${template.priority})`);
      });
    }
    
    // Check for employees to test with
    console.log('\nChecking for employees...');
    const [employeeCount] = await connection.query('SELECT COUNT(*) as count FROM employees');
    console.log(`Found ${employeeCount[0].count} employees`);
    
    if (employeeCount[0].count > 0) {
      const [employee] = await connection.query('SELECT id, name FROM employees LIMIT 1');
      
      if (employee.length > 0) {
        const employeeId = employee[0].id;
        console.log(`Using employee: ${employee[0].name} (ID: ${employeeId})`);
        
        // Check if employee has any checklist items
        const [checklistCount] = await connection.query(
          'SELECT COUNT(*) as count FROM onboarding_checklists WHERE employee_id = ?',
          [employeeId]
        );
        
        console.log(`Employee has ${checklistCount[0].count} checklist items`);
        
        // Add a test checklist item if there are none
        if (checklistCount[0].count === 0) {
          console.log('Adding a test checklist item...');
          await connection.query(`
            INSERT INTO onboarding_checklists 
            (employee_id, title, description, due_date, priority)
            VALUES (?, 'Test Checklist Item', 'This is a test item', DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY), 'Medium')
          `, [employeeId]);
          
          console.log('Test checklist item added!');
        }
      }
    }
    
    console.log('\n✅ Onboarding test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing onboarding:', error);
  } finally {
    if (connection) {
      console.log('Closing database connection...');
      await connection.end();
    }
  }
}

// Run the test
testOnboarding(); 