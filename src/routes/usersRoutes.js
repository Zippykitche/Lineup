const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/usersController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, requireRole('super_admin'), getAllUsers);
router.patch('/:uid/role', protect, requireRole('super_admin'), updateUserRole);
router.delete('/:uid', protect, requireRole('super_admin'), deleteUser);

module.exports = router;