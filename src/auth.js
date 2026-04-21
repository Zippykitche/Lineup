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
  try {
    const API_KEY = process.env.FIREBASE_WEB_API_KEY;

    // 👇 Switch URL based on emulator
    const baseUrl = process.env.USE_EMULATOR === "true"
      ? "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1"
      : "https://identitytoolkit.googleapis.com/v1";

    const url = `${baseUrl}/accounts:signInWithPassword?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      uid: data.localId,
      email: data.email,
      idToken: data.idToken,
    };
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message);
    return null;
  }
};