/**
 * Admin Controller
 * Handles admin operations: officer management, bulk assignment, statistics, analytics
 */

const storage = require('../utils/jsonStorage');
const advancedAI = require('../services/advancedAIService');

class AdminController {
  /**
   * Get overall system statistics
   */
  static async getSystemStats(req, res) {
    try {
      const complaints = storage.read('complaints.json') || [];
      const users = storage.read('users.json') || [];
      const departments = storage.read('departments.json') || [];

      // Calculate statistics
      const stats = {
        totalComplaints: complaints.length,
        totalUsers: users.length,
        totalDepartments: departments.length,
        complaintsByStatus: {
          submitted: complaints.filter(c => c.status === 'submitted').length,
          'in-progress': complaints.filter(c => c.status === 'in-progress' || c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          closed: complaints.filter(c => c.status === 'closed').length
        },
        complaintsByPriority: {
          low: complaints.filter(c => c.priority === 'low').length,
          medium: complaints.filter(c => c.priority === 'medium').length,
          high: complaints.filter(c => c.priority === 'high').length
        },
        complaintsByCategory: {},
        averageResolutionTime: 0,
        pendingCount: complaints.filter(c => c.status === 'submitted').length,
        overdueCount: 0,
        assignmentRate: 0
      };

      // Category breakdown
      complaints.forEach(c => {
        stats.complaintsByCategory[c.category] = (stats.complaintsByCategory[c.category] || 0) + 1;
      });

      // Calculate assignment rate
      const assignedComplaints = complaints.filter(c => c.assigned_officer_id).length;
      stats.assignmentRate = complaints.length > 0 ? Math.round((assignedComplaints / complaints.length) * 100) : 0;

      // Calculate average resolution time (for resolved complaints)
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.actual_resolution_date);
      if (resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const resolved = new Date(c.actual_resolution_date);
          return sum + (resolved - created);
        }, 0);
        stats.averageResolutionTime = Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24));
      }

      // Count overdue (pending for > 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      stats.overdueCount = complaints.filter(
        c => c.status === 'submitted' && new Date(c.created_at) < sevenDaysAgo
      ).length;

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a new officer account
   */
  static async createOfficer(req, res) {
    try {
      const { firstName, lastName, email, password, department, phone } = req.body;

      // Use userService to register (reuse logic)
      // We import userService inside the method or require it at top
      const userService = require('../services/userService');

      const result = await userService.registerUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        username: email.split('@')[0], // Generate username from email
        role: 'officer'
      });

      // Update with department if needed (custom field not in standard user model)
      if (department) {
        const users = storage.read('users.json');
        const userIndex = users.findIndex(u => u.id === result.user.id);
        if (userIndex !== -1) {
          users[userIndex].department = department;
          storage.write('users.json', users);
          result.user.department = department;
        }
      }

      res.status(201).json({
        success: true,
        message: 'Officer created successfully',
        officer: result.user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Assign a single complaint to an officer
   */
  static async assignComplaint(req, res) {
    try {
      const { complaintId } = req.params;
      const { officerId } = req.body;

      if (!officerId) {
        return res.status(400).json({ error: 'Officer ID is required' });
      }

      const complaints = storage.read('complaints.json') || [];
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);

      if (complaintIndex === -1) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Check if officer exists
      const users = storage.read('users.json') || [];
      const officer = users.find(u => u.id === officerId && (u.role === 'officer' || u.role === 'admin'));

      if (!officer) {
        return res.status(400).json({ error: 'Invalid officer selected' });
      }

      // Update complaint
      complaints[complaintIndex].assigned_officer_id = officerId;
      complaints[complaintIndex].assigned_at = new Date().toISOString();
      complaints[complaintIndex].status = 'in_progress'; // Auto move to in-progress

      // Add timeline entry
      if (!complaints[complaintIndex].timeline) complaints[complaintIndex].timeline = [];
      complaints[complaintIndex].timeline.push({
        status: 'assigned',
        timestamp: new Date().toISOString(),
        note: `Assigned to officer ${officer.first_name || ''} ${officer.last_name || ''}`
      });

      storage.write('complaints.json', complaints);

      res.json({
        success: true,
        message: 'Complaint assigned successfully',
        complaint: complaints[complaintIndex]
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get officer statistics and performance metrics
   */
  static async getOfficerStats(req, res) {
    try {
      const complaints = storage.read('complaints.json') || [];
      const users = storage.read('users.json') || [];
      const officers = users.filter(u => u.role === 'officer' || u.role === 'department_officer');

      const officerStats = officers.map(officer => {
        const assigned = complaints.filter(c => c.assigned_officer_id === officer.id);
        const resolved = assigned.filter(c => c.status === 'resolved');
        const pending = assigned.filter(c => c.status === 'submitted');
        const inProgress = assigned.filter(c => c.status === 'in-progress' || c.status === 'in_progress');

        // Calculate average resolution time
        let avgResolutionTime = 0;
        if (resolved.length > 0) {
          const totalTime = resolved.reduce((sum, c) => {
            const created = new Date(c.created_at);
            const finished = new Date(c.actual_resolution_date || Date.now());
            return sum + (finished - created);
          }, 0);
          avgResolutionTime = Math.round(totalTime / resolved.length / (1000 * 60 * 60 * 24));
        }

        return {
          id: officer.id,
          name: officer.first_name ? `${officer.first_name} ${officer.last_name}` : officer.email,
          email: officer.email,
          totalAssigned: assigned.length,
          resolved: resolved.length,
          inProgress: inProgress.length,
          pending: pending.length,
          resolutionRate: assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0,
          averageResolutionTime: avgResolutionTime,
          responseTime: Math.round(Math.random() * 24) + ' hours', // Placeholder
          department: officer.department || 'General'
        };
      });

      res.json(officerStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Bulk assign complaints to officers
   * POST body: { complaintIds: [], assignToOfficerId: "" }
   */
  static async bulkAssignComplaints(req, res) {
    try {
      const { complaintIds, assignToOfficerId } = req.body;

      if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
        return res.status(400).json({ error: 'No complaints selected' });
      }

      if (!assignToOfficerId) {
        return res.status(400).json({ error: 'No officer selected' });
      }

      const complaints = storage.read('complaints') || [];
      let updated = 0;

      const updatedComplaints = complaints.map(complaint => {
        if (complaintIds.includes(complaint.id)) {
          complaint.assignedTo = assignToOfficerId;
          complaint.assignedAt = new Date().toISOString();
          updated++;
        }
        return complaint;
      });

      storage.write('complaints', updatedComplaints);

      res.json({
        success: true,
        message: `${updated} complaints assigned successfully`,
        updated
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get complaints with AI analysis for admin review
   */
  static async getComplaintsWithAIAnalysis(req, res) {
    try {
      const complaints = storage.read('complaints') || [];
      const { limit = 20, offset = 0, status = null, category = null } = req.query;

      let filtered = complaints;

      if (status) filtered = filtered.filter(c => c.status === status);
      if (category) filtered = filtered.filter(c => c.category === category);

      // Add AI analysis to each complaint
      const analyzed = filtered.slice(offset, offset + parseInt(limit)).map(complaint => {
        const analysis = advancedAI.analyzeComplaintComprehensive(complaint, complaints);
        return {
          ...complaint,
          aiAnalysis: analysis
        };
      });

      res.json({
        total: filtered.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        complaints: analyzed
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get complaints grouped by category and status
   */
  static async getComplaintAnalytics(req, res) {
    try {
      const complaints = storage.read('complaints') || [];
      const analytics = {
        byCategory: {},
        byStatus: {},
        byPriority: {},
        byDepartment: {},
        timeline: []
      };

      complaints.forEach(complaint => {
        // By category
        if (!analytics.byCategory[complaint.category]) {
          analytics.byCategory[complaint.category] = { total: 0, statuses: {} };
        }
        analytics.byCategory[complaint.category].total++;
        analytics.byCategory[complaint.category].statuses[complaint.status] =
          (analytics.byCategory[complaint.category].statuses[complaint.status] || 0) + 1;

        // By status
        analytics.byStatus[complaint.status] = (analytics.byStatus[complaint.status] || 0) + 1;

        // By priority
        analytics.byPriority[complaint.priority] = (analytics.byPriority[complaint.priority] || 0) + 1;

        // By department
        const dept = complaint.department || 'Unassigned';
        analytics.byDepartment[dept] = (analytics.byDepartment[dept] || 0) + 1;
      });

      // Create timeline data (last 30 days)
      const timeline = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        timeline[dateStr] = 0;
      }

      complaints.forEach(complaint => {
        const dateStr = complaint.createdAt.split('T')[0];
        if (timeline[dateStr] !== undefined) {
          timeline[dateStr]++;
        }
      });

      analytics.timeline = Object.entries(timeline).map(([date, count]) => ({ date, count }));

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Find and get duplicate/similar complaints
   */
  static async findDuplicateComplaints(req, res) {
    try {
      const { complaintId } = req.params;
      const complaints = storage.read('complaints') || [];
      const complaint = complaints.find(c => c.id === complaintId);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const analysis = advancedAI.findSimilarComplaints(complaint, complaints);

      res.json({
        complaintId,
        category: complaint.category,
        ...analysis
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Merge duplicate complaints
   * POST body: { mainComplaintId: "", duplicateIds: [] }
   */
  static async mergeDuplicateComplaints(req, res) {
    try {
      const { mainComplaintId, duplicateIds } = req.body;

      if (!mainComplaintId || !duplicateIds || duplicateIds.length === 0) {
        return res.status(400).json({ error: 'Invalid merge parameters' });
      }

      const complaints = storage.read('complaints') || [];
      const mainComplaint = complaints.find(c => c.id === mainComplaintId);

      if (!mainComplaint) {
        return res.status(404).json({ error: 'Main complaint not found' });
      }

      // Add duplicate IDs to main complaint
      mainComplaint.duplicateIds = [...(mainComplaint.duplicateIds || []), ...duplicateIds];
      mainComplaint.status = 'resolved';
      mainComplaint.remarks = (mainComplaint.remarks || '') + ' [Merged duplicate complaints]';

      // Update main complaint
      const updated = complaints.map(c => c.id === mainComplaintId ? mainComplaint : c);

      storage.write('complaints', updated);

      res.json({
        success: true,
        message: `${duplicateIds.length} complaints merged`,
        merged: duplicateIds.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get department performance metrics
   */
  static async getDepartmentMetrics(req, res) {
    try {
      const complaints = storage.read('complaints') || [];
      const departments = storage.read('departments') || [];

      const metrics = departments.map(dept => {
        const deptComplaints = complaints.filter(c => c.department === dept.name);
        const resolved = deptComplaints.filter(c => c.status === 'resolved');
        const pending = deptComplaints.filter(c => c.status === 'pending');

        return {
          name: dept.name,
          total: deptComplaints.length,
          resolved: resolved.length,
          pending: pending.length,
          resolutionRate: deptComplaints.length > 0
            ? Math.round((resolved.length / deptComplaints.length) * 100)
            : 0,
          avgResolutionDays: resolved.length > 0
            ? Math.round(
              resolved.reduce((sum, c) => {
                const created = new Date(c.createdAt);
                const res = new Date(c.resolvedAt || Date.now());
                return sum + (res - created);
              }, 0) / resolved.length / (1000 * 60 * 60 * 24)
            )
            : 0
        };
      });

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AdminController;
