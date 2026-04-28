import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotificationToUsers,
} from '../services/notificationService.js';

// Create notification - Internal use (triggered by events)
export const createNotificationHandler = async (req, res) => {
  const { userId, message, type = 'reminder' } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: 'Missing required fields: userId, message' });
  }

  try {
    const notificationData = {
      userId,
      message,
      type,
    };

    const result = await createNotification(notificationData);

    if (!result) {
      return res.status(500).json({ message: 'Failed to create notification' });
    }

    res.status(201).json({ data: result, message: 'Notification created successfully', status: 201 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notifications for current user
export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, read } = req.query;

    const filters = {
      type: type || null,
      read: read ? read === 'true' : undefined,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === null && delete filters[key]);

    const allNotifications = await getNotifications(req.user.uid, filters);

    // Pagination
    const total = allNotifications.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginatedNotifications = allNotifications.slice(start, start + limitNum);

    res.json({
      data: paginatedNotifications,
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

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await markNotificationAsRead(id);

    if (!result) {
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }

    res.json({ message: 'Notification marked as read', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read for current user
export const markAllAsRead = async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.uid);

    if (!result) {
      return res.status(500).json({ message: 'Failed to mark notifications as read' });
    }

    res.json({ message: 'All notifications marked as read', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
export const deleteNotificationHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteNotification(id);

    if (!result) {
      return res.status(500).json({ message: 'Failed to delete notification' });
    }

    res.json({ message: 'Notification deleted successfully', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send notification to multiple users - Super Admin only
export const broadcastNotification = async (req, res) => {
  const { userIds, message, type = 'reminder' } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
    return res.status(400).json({ message: 'Missing required fields: userIds (array), message' });
  }

  try {
    const notificationData = {
      message,
      type,
    };

    const result = await sendNotificationToUsers(userIds, notificationData);

    if (!result) {
      return res.status(500).json({ message: 'Failed to send notifications' });
    }

    res.status(201).json({
      message: `Notification sent to ${userIds.length} users`,
      sentTo: userIds.length,
      status: 201,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
