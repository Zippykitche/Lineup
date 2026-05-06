import axios from 'axios';
import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';
const email = 'superadmin@kbc.co.ke';

async function testLogin(password, label) {
  console.log(`Testing login for ${email} with ${label} password: "${password}"`);
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    console.log(`✅ Login SUCCESS (Status: ${response.status})`);
    // console.log('Response data:', response.data);
    return true;
  } catch (err) {
    console.log(`❌ Login FAILED (Status: ${err.response?.status})`);
    if (err.response?.data) {
      console.log('Error message:', err.response.data.message);
    } else {
      console.log('Error:', err.message);
    }
    return false;
  }
}

async function run() {
  console.log('--- LOGIN VULNERABILITY TEST ---');
  
  // 1. Test with correct password (assuming Admin1234 from seed script)
  const correctPassword = process.env.SUPERADMIN_PASSWORD || 'Admin1234';
  await testLogin(correctPassword, 'CORRECT');
  
  console.log('\n--------------------------------\n');
  
  // 2. Test with wrong password
  const wrongPassword = 'CompletelyWrongPassword123!';
  const result = await testLogin(wrongPassword, 'WRONG');
  
  if (result) {
    console.log('\n🚨 VULNERABILITY STILL EXISTS! 🚨');
  } else {
    console.log('\n✅ VULNERABILITY FIXED! ✅');
  }
}

run();
