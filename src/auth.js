import { adminAuth } from './config/firebase.js';
import { getUserRole } from './userService.js';

/**
 * Verifies the Firebase ID token and returns the user with their role.
 * @param {string} idToken 
 */
export const verifySession = async (idToken) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const role = await getUserRole(decodedToken.uid);
    
    return {
      ...decodedToken,
      role,
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebaseClient.js';

/**
 * Sign in user using Firebase Client SDK (for backend testing).
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      idToken: idToken,
    };
  } catch (error) {
    throw error;
  }
};