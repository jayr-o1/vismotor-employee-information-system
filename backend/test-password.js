const bcrypt = require('bcryptjs');

const storedHash = '$2b$10$wJ9.iD3.g8Md9GNRYDUDbOz9HyXlBo1dWEjF8QjxZ7FqQ8wVpLrfW';
const testPassword = 'password123';

async function checkPassword() {
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    console.log(`Password '${testPassword}' matches stored hash: ${isMatch}`);
    
    // Additional test: Generate a hash for the same password to see if it works
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log('Generated new hash for same password:', newHash);
    
    const verification = await bcrypt.compare(testPassword, newHash);
    console.log(`Verification with new hash: ${verification}`);
  } catch (error) {
    console.error('Error testing password:', error);
  }
}

checkPassword(); 