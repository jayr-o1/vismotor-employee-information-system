// Script to test the login API endpoint
// Run with: node test-login-api.js
import 'dotenv/config';
import axios from 'axios';

// Set API URL - use the exact value from .env
const API_URL = 'http://10.10.1.71:5000';

// Define test credentials - try with one of your known admin emails
const TEST_EMAIL = 'test@vismotor.com'; 
const TEST_PASSWORD = '1234';

// Function to test the login API
async function testLoginAPI() {
  console.log('=== LOGIN API TEST ===');
  console.log(`Testing login with email: ${TEST_EMAIL}`);
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Make a direct request to the login API
    const response = await axios.post(`${API_URL}/api/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('Status code:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    
    return true;
  } catch (error) {
    console.log('❌ LOGIN FAILED');
    console.log('Status code:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    
    // Let's also test with a direct database check
    console.log('\nIf login failed, please:');
    console.log('1. Check the database schema (use the fix_login.sql script)');
    console.log('2. Examine server logs for detailed error information');
    console.log('3. Verify that the bcrypt version in the backend matches what was used to hash the password');
    console.log('4. Try using a different browser or incognito mode');
    
    return false;
  }
}

// Run the test
testLoginAPI()
  .then(success => {
    if (success) {
      console.log('\nYou can now log in through your application using:');
      console.log(`Email: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}`);
    } else {
      console.log('\nAdditional troubleshooting:');
      console.log('1. Try creating a new user with the fix_login.sql script');
      console.log('2. Check for CORS issues in the network tab of your browser');
      console.log('3. Ensure your frontend is sending the credentials in the right format');
    }
  })
  .catch(error => {
    console.error('Fatal script error:', error);
  }); 