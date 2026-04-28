import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getUserTasks,
} from '../services/taskService.js';

// Create task - Editor and Super Admin
export const createTaskHandler = async (req, res) => {
  const { title, dueDate, assigneeId, status = 'Pending', priority = 'Medium', description } = req.body;

  if (!title || !dueDate || !assigneeId) {
    return res.status(400).json({ message: 'Missing required fields: title, dueDate, assigneeId' });
  }

  try {
    const taskData = {
      title,
      dueDate,
      assigneeId,
      status,
      priority,
      description: description || '',
    };

    const result = await createTask(taskData, req.user.uid);

    if (!result) {
      return res.status(500).json({ message: 'Failed to create task' });
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
