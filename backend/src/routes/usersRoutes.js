import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole(['super_admin', 'editor']), getAllUsers);
router.patch('/:uid/role', verifyToken, requireRole(['super_admin']), updateUserRole);
router.delete('/:uid', verifyToken, requireRole(['super_admin']), deleteUser);

export default router;