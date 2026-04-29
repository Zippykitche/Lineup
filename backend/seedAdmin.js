import { adminAuth as auth, db } from './src/config/firebase.js';

const email = 'superadmin@kbc.co.ke';
const password = 'Admin1234';

const seedAdmin = async () => {
  try {
    let user;

    try {
      user = await auth.getUserByEmail(email);
      console.log('ℹ️ User already exists:', user.uid);

      await auth.updateUser(user.uid, {
        password,
        displayName: 'Super Admin',
      });

      console.log('✅ Password updated');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        user = await auth.createUser({
          email,
          password,
          displayName: 'Super Admin',
        });

        console.log('✅ User created:', user.uid);
      } else {
        throw err;
      }
    }

    await auth.setCustomUserClaims(user.uid, {
      role: 'super_admin',
    });

    await db.collection('users').doc(user.uid).set(
      {
        uid: user.uid,
        id: user.uid,
        email,
        workEmail: email,
        fullName: 'Super Admin',
        full_name: 'Super Admin',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log('✅ Super Admin seeded successfully');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('❌ Error:', err);
  }

  process.exit(0);
};

seedAdmin();