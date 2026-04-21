import { adminAuth as auth, db } from './src/config/firebase.js';

const testRoles = async () => {
  console.log('🚀 ROLES TEST STARTING...\n');

  const email = `test_role_${Date.now()}@kbc.co.ke`;
  const password = 'Test1234!';
  const role = 'editor';

  try {
    // Create user directly using Firebase Admin
    const user = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(user.uid, { role });
    await db.collection('users').doc(user.uid).set({
      uid: user.uid, email, role,
      created_at: new Date().toISOString()
    });
    console.log('✅ USER REGISTERED:', user.uid);

    // Get role from Firestore
    const doc = await db.collection('users').doc(user.uid).get();
    console.log('✅ USER ROLE:', doc.data().role);

    // Cleanup
    await auth.deleteUser(user.uid);
    await db.collection('users').doc(user.uid).delete();
    console.log('🧹 Test user cleaned up');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  process.exit(0);
};

testRoles();