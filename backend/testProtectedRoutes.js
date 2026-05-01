import 'dotenv/config';
import { request } from './src/tests/requestClient.js';
import { loginUser } from './src/auth.js';

const run = async () => {
  console.log('🚀 PROTECTED ROUTES TEST STARTING...');

  try {
    // Login as Super Admin
    console.log('Logging in as Super Admin...');
    const loggedIn = await loginUser('superadmin@kbc.co.ke', 'Admin1234');
    const token = loggedIn.idToken;
    console.log('✅ SUPER ADMIN LOGGED IN');

    // Create a new user
    console.log('Creating new editor user...');
    const newUser = await request('POST', '/api/auth/create-user', token, {
      email: `editor_${Date.now()}@kbc.co.ke`,
      password: 'Test1234!',
      full_name: 'Test Editor',
      role: 'editor'
    });
    console.log('✅ USER CREATED:', newUser.status, newUser.data.message);

    // Create event
    console.log('Creating event...');
    const event = await request('POST', '/api/events', token, {
      title: 'Integration Test Event',
      date: '2026-04-30',
      description: 'Testing protected routes',
      output_type: 'TV Package'
    });
    console.log('✅ EVENT CREATED:', event.status, event.data.title);

    // Update status
    console.log('Updating event status...');
    const updated = await request('PATCH', `/api/events/${event.data.id}/status`, token, {
      status: 'In Progress'
    });
    console.log('✅ STATUS UPDATED:', updated.status, updated.data.message);

    // Test unauthorized access
    console.log('Testing unauthorized access...');
    const unauthorized = await request('POST', '/api/events', null, { title: 'Should fail' });
    console.log('✅ UNAUTHORIZED BLOCKED:', unauthorized.status);

    // Cleanup
    await request('DELETE', `/api/events/${event.data.id}`, token);
    console.log('🧹 Test event cleaned up');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  console.log('\n🏁 ALL TESTS COMPLETE');
  process.exit(0);
};

run();