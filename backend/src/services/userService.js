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