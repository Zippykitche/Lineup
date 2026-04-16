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

/**
 * Sign in user using Firebase Auth REST API (for backend testing).
 */
export const loginUser = async (email, password) => {
  const API_KEY = process.env.FIREBASE_WEB_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    // Returns basic user info similar to client SDK
    return { uid: data.localId, email: data.email, idToken: data.idToken };
  } catch (error) {
    console.error("Login error:", error.message);
    return null;
  }
};