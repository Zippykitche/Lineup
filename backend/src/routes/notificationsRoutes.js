import express from 'express';
import {
  createNotificationHandler,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  broadcastNotification,
} from '../controllers/notificationsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create notification - Internal use (could restrict further)
router.post('/', verifyToken, createNotificationHandler);

// Get notifications for current user
router.get('/', verifyToken, getMyNotifications);

// Mark all notifications as read
router.patch('/read-all', verifyToken, markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', verifyToken, markAsRead);

// Delete notification
router.delete('/:id', verifyToken, deleteNotificationHandler);

// Broadcast notification to multiple users - Super Admin only
router.post('/broadcast', verifyToken, requireRole(['super_admin']), broadcastNotification);

export default router;
