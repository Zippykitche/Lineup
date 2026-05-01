import 'dotenv/config';
import { request } from './requestClient.js';

// Override BASE_URL for testing
process.env.BASE_URL = 'http://localhost:5000';

const testForgotPassword = async () => {
  console.log('🚀 TESTING FORGOT PASSWORD');

  try {
    console.log('\n1️⃣ Testing forgot password with valid email...');
    const forgotResponse = await request('POST', '/api/auth/forgot-password', null, {
      email: 'superadmin@kbc.co.ke'
    });

    if (forgotResponse.status === 200) {
      console.log('✅ FORGOT PASSWORD SUCCESSFUL');
      console.log('Response:', forgotResponse.data.message);
    } else {
      console.log('❌ FORGOT PASSWORD FAILED');
      console.log('Status:', forgotResponse.status);
      console.log('Response:', forgotResponse.data);
    }

    console.log('\n2️⃣ Testing forgot password with invalid email...');
    const invalidResponse = await request('POST', '/api/auth/forgot-password', null, {
      email: 'nonexistent@kbc.co.ke'
    });

    if (invalidResponse.status === 200) {
      console.log('✅ INVALID EMAIL HANDLED CORRECTLY (Security: Always returns success)');
      console.log('Response:', invalidResponse.data.message);
    } else {
      console.log('❌ INVALID EMAIL NOT HANDLED PROPERLY');
      console.log('Status:', invalidResponse.status);
      console.log('Response:', invalidResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testForgotPassword();