import express from 'express';
import axios from 'axios';
import { adminAuth as auth, db, admin } from '../config/firebase.js';
import {
  createUser,
  getMe,
  getAllUsers,
  updateUserRole,
  deleteUser,
  suspendUser,
  unsuspendUser,
  forgotPassword,
  logout,
} from '../controllers/authController.js'; // Ensure .js extension for ESM
import { verifyToken } from '../middleware/authMiddleware.js'; // Renamed from protect
import { requireRole } from '../middleware/roleMiddleware.js'; // Import requireRole

const router = express.Router();

/**
 * Login route
 * Verifies user credentials using Firebase Auth REST API.
 * Securely handles authentication without bypassing password checks.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`[AUTH] Login attempt: ${email}`);
    
    // Check if using emulator
    const isEmulator = process.env.USE_EMULATOR === 'true';
    const apiKey = process.env.FIREBASE_API_KEY;
    
    if (!apiKey && !isEmulator) {
      console.error('[AUTH] FIREBASE_API_KEY is missing in environment variables');
      return res.status(500).json({ message: 'Authentication service configuration error' });
    }

    // Determine login URL (Emulator vs Production)
    const loginUrl = isEmulator
      ? `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`
      : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    // Verify credentials via Firebase REST API
    const response = await axios.post(loginUrl, {
      email,
      password,
      returnSecureToken: true
    });

    console.log('[AUTH] Login successful');
    const uid = response.data.localId;
    
    // Fetch associated user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    if (!userDoc.exists) {
      console.warn(`[AUTH] No Firestore document found for authenticated user: ${uid}`);
    }

    res.json({
      data: {
        token: response.data.idToken,
        refreshToken: response.data.refreshToken,
        email: response.data.email,
        uid: uid,
        fullName: userData.fullName || userData.full_name || response.data.displayName || 'User',
        role: userData.role || 'assignee'
      }
    });
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.error(`[AUTH] Login failed: ${errorMsg}`);
    
    // Always return 401 for authentication failures to prevent account enumeration
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Forgot password - sends reset email via Firebase
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Super Admin and Editor routes
router.post('/create-user', verifyToken, requireRole(['super_admin']), createUser); 
router.get('/users', verifyToken, requireRole(['super_admin', 'editor', 'assignee']), getAllUsers); 
router.patch('/users/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole); 
router.patch('/users/:uid/suspend', verifyToken, requireRole(['super_admin']), suspendUser); 
router.patch('/users/:uid/unsuspend', verifyToken, requireRole(['super_admin']), unsuspendUser); 
router.delete('/users/:uid', verifyToken, requireRole(['super_admin']), deleteUser); 

export default router;
