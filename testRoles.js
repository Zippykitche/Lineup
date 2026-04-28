import 'dotenv/config';
import { adminAuth, db } from './src/config/firebase.js';

const run = async () => {
  console.log('🚀 ROLES TEST STARTING...');

  const email = `test_role_${Date.now()}@kbc.co.ke`;
  const password = 'Test1234!';
  const role = 'editor';

  try {
    // Create user with role
    const user = await adminAuth.createUser({ email, password, emailVerified: true });
    await adminAuth.setCustomUserClaims(user.uid, { role });
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      role,
      created_at: new Date().toISOString()
    });
    console.log('✅ USER REGISTERED:', user.uid);

    // Verify role in Firestore
    const doc = await db.collection('users').doc(user.uid).get();
    console.log('✅ USER ROLE:', doc.data().role);

    // Verify custom claim
    const claims = await adminAuth.getUser(user.uid);
    console.log('✅ CUSTOM CLAIM:', claims.customClaims?.role);

    // Cleanup
    await adminAuth.deleteUser(user.uid);
    await db.collection('users').doc(user.uid).delete();
    console.log('🧹 Test user cleaned up');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  process.exit(0);
};

run();