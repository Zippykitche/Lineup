import express from 'express';
import {
  createTaskHandler,
  getAllTasks,
  getTaskByIdHandler,
  updateTaskHandler,
  deleteTaskHandler,
  getMyTasks,
  updateTaskStatus,
} from '../controllers/tasksController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create task - Editor and Super Admin only
router.post('/', verifyToken, requireRole(['editor', 'super_admin']), createTaskHandler);

// Get all tasks - Editor and Super Admin only
router.get('/', verifyToken, requireRole(['editor', 'super_admin']), getAllTasks);

// Get my tasks (assigned to current user) - Assignee
router.get('/my-tasks', verifyToken, getMyTasks);

// Get task by ID
router.get('/:id', verifyToken, getTaskByIdHandler);

// Update task - Editors/Admins full access, Assignees status only
router.patch('/:id', verifyToken, requireRole(['editor', 'super_admin', 'assignee']), updateTaskHandler);

// Update task status - Specific endpoint
router.patch('/:id/status', verifyToken, updateTaskStatus);

// Delete task - Super Admin only
router.delete('/:id', verifyToken, requireRole(['super_admin']), deleteTaskHandler);

export default router;
