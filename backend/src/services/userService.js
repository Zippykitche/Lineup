import { db } from '../config/firebase.js';

export const getUserRole = async (uid) => {
  const doc = await db.collection('users').doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data().role;
};

export const getUserById = async (uid) => {
  const doc = await db.collection('users').doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

export const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('❌ GET ALL USERS ERROR:', error.message);
    return [];
  }
};