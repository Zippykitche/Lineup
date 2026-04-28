import 'dotenv/config';
import { adminAuth } from './src/config/firebase.js';
import { loginUser } from './src/auth.js';

const run = async () => {
  console.log('🚀 AUTH TEST STARTING...');

  const email = `test_${Date.now()}@kbc.co.ke`;
  const password = 'Test1234!';

  try {
    // Register
    console.log('Creating user...');
    const user = await adminAuth.createUser({ 
      email, 
      password,
      emailVerified: true
    });
    console.log('✅ USER REGISTERED:', user.uid);

    // Login
    console.log('Logging in...');
    const loggedIn = await loginUser(email, password);
    console.log('✅ LOGIN SUCCESS');
    console.log('EMAIL:', loggedIn.email);
    console.log('UID:', loggedIn.uid);

    // Cleanup
    await adminAuth.deleteUser(user.uid);
    console.log('🧹 Test user cleaned up');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  process.exit(0);
};

run();