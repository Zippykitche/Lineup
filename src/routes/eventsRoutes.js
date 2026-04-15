const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getMyEvents,
  updateEvent,
  updateStatus,
  deleteEvent
} = require('../controllers/eventsController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('editor', 'super_admin'), createEvent);
router.get('/', protect, requireRole('editor', 'super_admin'), getAllEvents);
router.get('/my-events', protect, requireRole('assignee'), getMyEvents);
router.patch('/:id', protect, requireRole('editor', 'super_admin'), updateEvent);
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id', protect, requireRole('super_admin'), deleteEvent);

module.exports = router;