/**
 * Authorization Middleware
 * Checks user roles and permissions
 * Roles: student | staff | admin
 */

/**
 * Authorize specific roles
 * @param {...string} allowedRoles - Roles that can access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Check if user is admin (admin-only actions)
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

/**
 * Check if user is admin or staff (previously isAdminOrOfficer)
 */
const isAdminOrOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only administrators and staff can access this resource',
    });
  }
  next();
};

// Alias for clarity
const isAdminOrStaff = isAdminOrOfficer;

/**
 * Check if user is the complaint owner OR admin/staff
 */
const isOwnerOrOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    return next();
  }
  if (req.complaint && req.complaint.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this complaint',
    });
  }
  next();
};

module.exports = {
  authorize,
  isAdmin,
  isAdminOrOfficer,
  isAdminOrStaff,
  isOwnerOrOfficer,
};
