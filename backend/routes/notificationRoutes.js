/**
 * Notification Routes
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Protected Routes
 */

// Get user notifications
router.get(
  '/',
  authenticateToken,
  notificationController.getUserNotifications
);

// Mark notification as read
router.put(
  '/:id/read',
  authenticateToken,
  notificationController.markNotificationAsRead
);

module.exports = router;
