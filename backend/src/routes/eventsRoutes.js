import express from 'express';
import {
  createEvent,
  getPublicEvents,
  getAllEvents,
  getMyEvents,
  updateEvent,
  updateStatus,
  deleteEvent
} from '../controllers/eventsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public holidays - accessible to everyone
router.get('/public', getPublicEvents);

router.post('/', verifyToken, requireRole(['editor', 'super_admin']), createEvent);
router.get('/', verifyToken, requireRole(['editor', 'super_admin', 'assignee']), getAllEvents);
router.get('/my-events', verifyToken, requireRole(['assignee']), getMyEvents);
router.patch('/:id', verifyToken, requireRole(['editor', 'super_admin']), updateEvent);
router.patch('/:id/status', verifyToken, updateStatus);
router.delete('/:id', verifyToken, requireRole(['editor', 'super_admin']), deleteEvent);

export default router;