/**
 * Authentication Middleware
 * Verifies JWT tokens and extracts user information
 */
const { verifyToken } = require('../utils/jwtToken');

/**
 * Authenticate JWT Token
 * Middleware to verify JWT token from request headers
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Add user data to request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Optional Authentication
 * Middleware for optional JWT verification
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Silently fail - user is optional
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
