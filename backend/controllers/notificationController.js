/**
 * Notification Controller
 * Handles notification-related HTTP requests
 */
const notificationService = require('../services/notificationService');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get user notifications
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const result = await notificationService.getUserNotifications(
    req.user.id,
    parseInt(limit),
    parseInt(offset)
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Mark notification as read
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.markNotificationAsRead(id);

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
};
