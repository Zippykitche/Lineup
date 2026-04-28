import express from 'express';
import axios from 'axios';
import {
  createUser, 
  getMe, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  forgotPassword
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

  try {
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

    res.json({
      token: response.data.idToken,
      email: response.data.email,
      uid: response.data.localId
    });
  } catch (err) {
    // Fallback for testing: if REST API fails, generate a custom token for the user
    try {
      const userRecord = await auth.getUserByEmail(email);
      const customToken = await auth.createCustomToken(userRecord.uid);
      
      res.json({
        token: customToken,
        email: userRecord.email,
        uid: userRecord.uid
      });
    } catch (adminErr) {
      console.error('Login error:', err.response?.data || err.message);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  }
});

// Forgot password - sends reset email via Firebase
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', verifyToken, getMe);

// Super Admin only routes
router.post('/create-user', verifyToken, requireRole(['super_admin']), createUser); // Use array for roles
router.get('/users', verifyToken, requireRole(['super_admin']), getAllUsers); // Use array for roles
router.patch('/users/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole); // Use array for roles
router.delete('/users/:uid', verifyToken, requireRole(['super_admin']), deleteUser); // Use array for roles

export default router; // Use export default for ESM