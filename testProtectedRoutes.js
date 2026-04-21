import 'dotenv/config';
import { request } from './src/tests/requestClient.js';

const run = async () => {
  console.log('🚀 PROTECTED ROUTE TEST START');

  try {
    // 1. Login as Super Admin first
    console.log('Logging in as Super Admin...');
    const login = await request('POST', '/api/auth/login', null, {
      email: 'superadmin@kbc.co.ke',
      password: 'Admin1234!',
    });
    console.log('🔑 LOGIN RESPONSE:', login.status, login.data);

    if (login.status !== 200) {
      throw new Error(`Login failed with status ${login.status}`);
    }

    const token = login.data.token || login.data.idToken;

    // 2. Create a new user as Super Admin
    console.log('Creating new user...');
    const newUser = await request('POST', '/api/auth/create-user', token, {
      email: `test_editor_${Date.now()}@kbc.co.ke`,
      password: 'Test1234!',
      full_name: 'Test Editor',
      role: 'editor',
    });
    console.log('🧑 CREATE USER RESPONSE:', newUser.status, newUser.data);

    // 3. Create event
    console.log('Creating event...');
    const event = await request('POST', '/api/events', token, {
      title: 'Terminal Test Event',
      date: '2026-04-20',
      description: 'Created via terminal script',
      output_type: 'TV Package',
    });
    console.log('📦 EVENT RESPONSE:', event.status, event.data);

    // 4. Test unauthorized access
    console.log('Testing unauthorized access...');
    const unauthorized = await request('POST', '/api/events', null, { title: 'Should fail' });
    console.log('🚫 UNAUTHORIZED TEST:', unauthorized.status, unauthorized.data);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }

  console.log('✅ TEST COMPLETE');
};

run();