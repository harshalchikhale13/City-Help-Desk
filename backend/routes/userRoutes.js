/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { validateRegister, validateLogin, handleValidationErrors } = require('../utils/validators');

/**
 * Public Routes
 */

// Register user
router.post(
  '/register',
  validateRegister(),
  handleValidationErrors,
  userController.register
);

// Login user
router.post(
  '/login',
  validateLogin(),
  handleValidationErrors,
  userController.login
);

/**
 * Protected Routes
 */

// Get current user profile
router.get(
  '/profile',
  authenticateToken,
  userController.getProfile
);

// Update user profile
router.put(
  '/profile',
  authenticateToken,
  userController.updateProfile
);

/**
 * Admin Routes
 */

// Get all users
router.get(
  '/',
  authenticateToken,
  authorize('admin'),
  userController.getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  authenticateToken,
  authorize('admin'),
  userController.getUserById
);

module.exports = router;
