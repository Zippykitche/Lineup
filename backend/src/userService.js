import { adminAuth, db } from './config/firebase.js';

/**
 * Creates a new user in Firebase Auth and assigns a role in Firestore.
 * @param {string} email 
 * @param {string} password 
 * @param {string} role - 'super_admin' | 'editor' | 'assignee'
 */
export const registerUser = async (email, password, role) => {
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Store role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

export const getUserRole = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return null;
  }
  return userDoc.data().role;
};