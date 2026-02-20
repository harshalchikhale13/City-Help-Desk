/**
 * Complaint Routes
 * Roles: student | staff | admin
 */
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/auth');
const { authorize, isAdminOrOfficer } = require('../middleware/authorization');
const { validateComplaint, handleValidationErrors } = require('../utils/validators');

// Create complaint — students, staff, and admins can all create issues
router.post(
  '/',
  authenticateToken,
  authorize('student', 'staff', 'admin'),
  validateComplaint(),
  handleValidationErrors,
  complaintController.createComplaint
);

// Get complaint statistics (admin and staff) - MUST be before /:id
router.get(
  '/stats/overview',
  authenticateToken,
  isAdminOrOfficer,
  complaintController.getComplaintStats
);

// Get all complaints with filters (any authenticated user)
router.get(
  '/',
  authenticateToken,
  complaintController.getAllComplaints
);

// Get complaint by ID
router.get(
  '/:id',
  authenticateToken,
  complaintController.getComplaintById
);

// Get complaint history
router.get(
  '/:id/history',
  authenticateToken,
  complaintController.getComplaintHistory
);

// Update complaint status (admin and staff only)
router.put(
  '/:id/status',
  authenticateToken,
  isAdminOrOfficer,
  complaintController.updateComplaintStatus
);

// Delete complaint (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorize('admin'),
  complaintController.deleteComplaint
);

// Add complaint update/comment (admin and staff)
router.post(
  '/:id/updates',
  authenticateToken,
  isAdminOrOfficer,
  complaintController.addComplaintUpdate
);

module.exports = router;
