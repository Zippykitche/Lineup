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

    // Explicitly check for success and presence of token
    if (!response.data || !response.data.idToken) {
      console.error('[AUTH] Login response missing idToken');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

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
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.error(`[AUTH] Login failed: ${errorMsg}`);
    
    // Standardize error response
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Forgot password - sends reset email via Firebase
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Super Admin and Editor routes, plus assignee can view users
router.post('/create-user', verifyToken, requireRole(['super_admin']), createUser); 
router.get('/users', verifyToken, requireRole(['super_admin', 'editor', 'assignee']), getAllUsers); 
router.patch('/users/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole); 
router.delete('/users/:uid', verifyToken, requireRole(['super_admin']), deleteUser); 

export default router; // Use export default for ESM
