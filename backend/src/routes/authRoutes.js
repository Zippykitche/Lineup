import express from 'express';
import axios from 'axios';
import { adminAuth as auth, db, admin } from '../config/firebase.js';
import {
  createUser,
  getMe,
  getAllUsers,
  updateUserRole,
  deleteUser,
  forgotPassword,
  logout,
} from '../controllers/authController.js'; // Ensure .js extension for ESM
import { verifyToken } from '../middleware/authMiddleware.js'; // Renamed from protect
import { requireRole } from '../middleware/roleMiddleware.js'; // Import requireRole

const router = express.Router();

// Public - no auth needed
// Note: actual login is handled by Firebase Auth on the frontend
// Backend just verifies the token Firebase gives back

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const currentProjectId = admin.app().options.projectId;

  try {
    console.log(`[AUTH] Login attempt: ${email} (Project: ${currentProjectId})`);
    // Try Firebase REST API
    const isEmulator = process.env.USE_EMULATOR === 'true';
    const loginUrl = isEmulator
      ? `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`
      : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

    const response = await axios.post(loginUrl, {
      email,
      password,
      returnSecureToken: true
    });

    console.log('[AUTH] Firebase REST API login successful');
    const uid = response.data.localId;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      data: {
        token: response.data.idToken,
        email: response.data.email,
        uid: uid,
        fullName: userData.fullName || userData.full_name || response.data.displayName,
        role: userData.role || 'assignee'
      }
    });
  } catch (err) {
    console.error(`[AUTH] Firebase REST API failed: ${err.response?.data?.error?.message || err.message}`);
    // Fallback for testing: if REST API fails, generate a custom token for the user
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log(`[AUTH] User found in Auth: ${userRecord.uid}. Generating custom token...`);
      const customToken = await auth.createCustomToken(userRecord.uid);
      
      // We NEED an ID token for verifyIdToken middleware to work.
      // Exchange custom token for ID token using Firebase REST API
      const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`;
      const exchangeResponse = await axios.post(exchangeUrl, {
        token: customToken,
        returnSecureToken: true
      });

      console.log('[AUTH] Custom token exchange successful');
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      res.json({
        data: {
          token: exchangeResponse.data.idToken,
          email: userRecord.email,
          uid: userRecord.uid,
          fullName: userData.fullName || userData.full_name || userRecord.displayName,
          role: userData.role || 'assignee'
        }
      });
    } catch (adminErr) {
      console.error(`[AUTH] Login fallback failed: ${adminErr.message}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  }
});

// Forgot password - sends reset email via Firebase
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Super Admin only routes
router.post('/create-user', verifyToken, requireRole(['super_admin']), createUser); // Use array for roles
router.get('/users', verifyToken, requireRole(['super_admin']), getAllUsers); // Use array for roles
router.patch('/users/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole); // Use array for roles
router.delete('/users/:uid', verifyToken, requireRole(['super_admin']), deleteUser); // Use array for roles

export default router; // Use export default for ESM