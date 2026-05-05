import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getUserTasks,
} from '../services/taskService.js';
import { createNotification } from '../services/notificationService.js';

// Create task - Editor and Super Admin
export const createTaskHandler = async (req, res) => {
  const { title, dueDate, assigneeIds, status = 'Pending', priority = 'Medium', description, eventId } = req.body;

  if (!title || !dueDate || !assigneeIds || !Array.isArray(assigneeIds)) {
    return res.status(400).json({ message: 'Missing required fields: title, dueDate, assigneeIds (array)' });
  }

  try {
    const taskData = {
      title,
      dueDate,
      assigneeIds,
      status,
      priority,
      description: description || '',
      eventId: eventId || null,
    };

    const result = await createTask(taskData, req.user.uid);

    if (!result) {
      return res.status(500).json({ message: 'Failed to create task' });
    }

    // Notify assignees
    for (const assigneeId of assigneeIds) {
      await createNotification({
        userId: assigneeId,
        message: `New task assigned: ${title} (Due: ${dueDate})`,
        type: 'task',
        targetId: result.id,
        targetType: 'task'
      });
    }

    res.status(201).json({ data: result, message: 'Task created successfully', status: 201 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks with pagination and filters
export const getAllTasks = async (req, res) => {
  try {
    // All authenticated users can see tasks
    if (req.user.role !== 'super_admin' && req.user.role !== 'editor' && req.user.role !== 'assignee') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { status, assigneeId, priority, page = 1, limit = 10, search } = req.query;

    const filters = {
      status: status || null,
      assigneeId: assigneeId || null,
      priority: priority || null,
    };

    // Remove null filters
    Object.keys(filters).forEach(key => filters[key] === null && delete filters[key]);

    const allTasks = await getTasks(filters);

    // Apply search filter if provided
    let filtered = allTasks;
    if (search) {
      filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Pagination
    const total = filtered.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginatedTasks = filtered.slice(start, start + limitNum);

    res.json({
      data: paginatedTasks,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get task by ID
export const getTaskByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ data: task, status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task - Editor and Super Admin
export const updateTaskHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If user is an assignee, they can ONLY update the status
    if (req.user.role === 'assignee') {
      const updateKeys = Object.keys(req.body);
      const isOnlyStatus = updateKeys.length === 1 && updateKeys[0] === 'status';

      if (!isOnlyStatus) {
        return res.status(403).json({ message: 'Assignees can only update the status of a task' });
      }

      // Also ensure they are the one assigned to it
      if (!task.assigneeIds || !task.assigneeIds.includes(req.user.uid)) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }
    }

    const result = await updateTask(id, req.body);

    if (!result) {
      return res.status(500).json({ message: 'Failed to update task' });
    }

    res.json({ data: result, message: 'Task updated successfully', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete task - Super Admin only
export const deleteTaskHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteTask(id);

    if (!result) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }

    res.json({ data: null, message: 'Task deleted successfully', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tasks for current user (Assignee)
export const getMyTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;

    let tasks = await getUserTasks(req.user.uid);

    // Apply filters
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    // Pagination
    const total = tasks.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginatedTasks = tasks.slice(start, start + limitNum);

    res.json({
      data: paginatedTasks,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task status - Assignee can update their own tasks
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'In Progress', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Strict check: only assigned users can update their own status
    if (req.user.role === 'assignee' && (!task.assigneeIds || !task.assigneeIds.includes(req.user.uid))) {
      return res.status(403).json({ message: 'Not authorized to update this task status' });
    }

    const result = await updateTask(id, { status });

    if (!result) {
      return res.status(500).json({ message: 'Failed to update task status' });
    }

    res.json({ data: result, message: 'Status updated successfully', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
