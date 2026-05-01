import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDePD9pELsholnhJ5PXStAyXNArsa_Kt3w",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "kbc-lineup"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kbc-lineup",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "kbc-lineup"}.appspot.com`,
  messagingSenderId: "115165727487920399525",
  appId: "1:115165727487920399525:web:1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;