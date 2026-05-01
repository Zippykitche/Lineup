import 'dotenv/config';
import { request } from './requestClient.js';

// Override BASE_URL for testing
process.env.BASE_URL = 'http://localhost:5000';

const testSuperAdminLogin = async () => {
  console.log('🚀 TESTING SUPERADMIN LOGIN');

  try {
    console.log('\n1️⃣ Testing login with correct credentials...');
    const loginResponse = await request('POST', '/api/auth/login', null, {
      email: 'superadmin@kbc.co.ke',
      password: 'Admin1234'
    });

    if (loginResponse.status === 200) {
      console.log('✅ LOGIN SUCCESSFUL');
      console.log('User ID:', loginResponse.data.data.uid);
      console.log('Email:', loginResponse.data.data.email);
      console.log('Full Name:', loginResponse.data.data.fullName);
      console.log('Role:', loginResponse.data.data.role);
      console.log('Token:', loginResponse.data.data.token ? 'Present' : 'Missing');

      // Test accessing a protected route
      console.log('\n2️⃣ Testing access to protected route...');
      const protectedResponse = await request('GET', '/api/events', loginResponse.data.data.token);
      if (protectedResponse.status === 200) {
        console.log('✅ PROTECTED ROUTE ACCESS SUCCESSFUL');
        console.log('Events count:', protectedResponse.data.data?.length || 0);
      } else {
        console.log('❌ PROTECTED ROUTE ACCESS FAILED');
        console.log('Status:', protectedResponse.status);
        console.log('Response:', protectedResponse.data);
      }

    } else {
      console.log('❌ LOGIN FAILED');
      console.log('Status:', loginResponse.status);
      console.log('Response:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testSuperAdminLogin();