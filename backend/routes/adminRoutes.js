/**
 * Admin Routes
 * Protected routes for admin operations only
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorize('admin'));

// System statistics
router.get('/stats/system', AdminController.getSystemStats);

// Officer statistics and performance
router.get('/stats/officers', AdminController.getOfficerStats);

// Create new officer
router.post('/officers', AdminController.createOfficer);

// Assign complaint to officer
router.post('/complaints/:complaintId/assign', AdminController.assignComplaint);

// Department metrics
router.get('/stats/departments', AdminController.getDepartmentMetrics);

// Complaint analytics and insights
router.get('/analytics/complaints', AdminController.getComplaintAnalytics);

// Get complaints with AI analysis
router.get('/complaints/analyzed', AdminController.getComplaintsWithAIAnalysis);

// Find duplicate complaints
router.get('/complaints/duplicates/:complaintId', AdminController.findDuplicateComplaints);

// Merge duplicate complaints
router.post('/complaints/merge-duplicates', AdminController.mergeDuplicateComplaints);

// Bulk assign complaints
router.post('/complaints/bulk-assign', AdminController.bulkAssignComplaints);

module.exports = router;
