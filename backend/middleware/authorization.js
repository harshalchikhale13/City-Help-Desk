/**
 * Authorization Middleware
 * Checks user roles and permissions
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
 * Check if user is admin or department officer
 */
const isAdminOrOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!['admin', 'department_officer'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only administrators and department officers can access this resource',
    });
  }

  next();
};

/**
 * Check if user is complaint owner or admin/officer
 */
const isOwnerOrOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // This middleware should be used after complaint is loaded in req.complaint
  if (req.user.role === 'admin' || req.user.role === 'department_officer') {
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
  isAdminOrOfficer,
  isOwnerOrOfficer,
};
