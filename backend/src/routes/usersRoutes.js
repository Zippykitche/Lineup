import express from 'express';
import { getAllUsers, updateUserRole, deleteUser, suspendUser, unsuspendUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole(['super_admin', 'editor', 'assignee']), getAllUsers);
router.patch('/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole);
router.patch('/:uid/suspend', verifyToken, requireRole(['super_admin']), suspendUser);
router.patch('/:uid/unsuspend', verifyToken, requireRole(['super_admin']), unsuspendUser);
router.delete('/:uid', verifyToken, requireRole(['super_admin']), deleteUser);

export default router;