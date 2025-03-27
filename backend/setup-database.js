const fs = require('fs');
const path = require('path');

// Check if mysql2 is installed
try {
  require('mysql2/promise');
} catch (err) {
  console.error('\n❌ Error: mysql2 package is not installed.');
  console.error('Please run: npm install mysql2');
  process.exit(1);
}

// Make sure database.js exists
const dbConfigPath = path.join(__dirname, 'src', 'configs', 'database.js');
if (!fs.existsSync(dbConfigPath)) {
  console.error('\n❌ Error: database.js config file not found.');
  console.error(`Expected at: ${dbConfigPath}`);
  process.exit(1);
}

// Import our database setup modules
const initializeDatabase = require('./src/configs/init-database');
const addSampleData = require('./src/configs/add-sample-data');

// Helper function to parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    init: true,
    sample: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--sample' || arg === '-s') {
      options.sample = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--init-only' || arg === '-i') {
      options.init = true;
      options.sample = false;
    }
  }

  return options;
}

// Display help information
function displayHelp() {
  console.log(`
Vismotor Employee Information System - Database Setup

Usage: node setup-database.js [options]

Options:
  --help, -h       Display this help information
  --sample, -s     Initialize database and add sample data
  --init-only, -i  Only initialize database structure (default)

Examples:
  node setup-database.js
  node setup-database.js --sample
  `);
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    displayHelp();
    return;
  }

  console.log('📊 Vismotor Employee Information System - Database Setup\n');

  if (options.init) {
    console.log('Step 1: Initializing database structure...\n');
    await initializeDatabase();
  }

  if (options.sample) {
    console.log('\nStep 2: Adding sample data...\n');
    await addSampleData();
  }

  console.log('\n🎉 Database setup process completed!');
  
  if (!options.sample) {
    console.log('\nNote: No sample data was added. To add sample data, run:');
    console.log('node setup-database.js --sample');
  }
  
  console.log('\nYou can now start the server with: npm run dev');
}

// Run the main function
main().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
}); 