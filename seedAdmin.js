import { adminAuth as auth, db } from './src/config/firebase.js';

const seedAdmin = async () => {
  try {
    const user = await auth.createUser({
      email: 'superadmin@kbc.co.ke',
      password: 'Admin1234!',
      displayName: 'Super Admin'
    });

    await auth.setCustomUserClaims(user.uid, { role: 'super_admin' });

    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: 'superadmin@kbc.co.ke',
      full_name: 'Super Admin',
      role: 'super_admin',
      created_at: new Date().toISOString()
    });

    console.log('✅ Super Admin created:', user.uid);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit(0);
};

seedAdmin();