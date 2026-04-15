const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getMe, 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
} = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Public - no auth needed
// Note: actual login is handled by Firebase Auth on the frontend
// Backend just verifies the token Firebase gives back

// Protected routes
router.get('/me', protect, getMe);

// Super Admin only routes
router.post('/create-user', protect, requireRole('super_admin'), createUser);
router.get('/users', protect, requireRole('super_admin'), getAllUsers);
router.patch('/users/:uid/role', protect, requireRole('super_admin'), updateUserRole);
router.delete('/users/:uid', protect, requireRole('super_admin'), deleteUser);

module.exports = router;