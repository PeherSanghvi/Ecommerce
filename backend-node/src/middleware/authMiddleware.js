/**
 * Authentication & Authorization Middleware
 * 
 * Provides role-based access control (RBAC) for protected routes
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

/**
 * Verify JWT token and extract user info
 */
function verifyToken(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.body && req.body.token) {
      token = req.body.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token'
    });
  }
}

/**
 * Verify user is authenticated
 */
function isAuthenticated(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user._id) {
      next();
    } else {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated'
      });
    }
  });
}

/**
 * Verify user is ADMIN
 */
function isAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
    }
  });
}

/**
 * Verify user has specific role
 */
function hasRole(requiredRole) {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user && req.user.role === requiredRole) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: `Forbidden: ${requiredRole} role required`
        });
      }
    });
  };
}

/**
 * Verify user is the resource owner or admin
 */
function isOwnerOrAdmin(req, res, next) {
  verifyToken(req, res, () => {
    const resourceUserId = req.params.userId;
    const currentUserId = req.user?._id;
    const isUserAdmin = req.user?.role === 'ADMIN';

    if (currentUserId === resourceUserId || isUserAdmin) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Access denied'
      });
    }
  });
}

module.exports = {
  verifyToken,
  isAuthenticated,
  isAdmin,
  hasRole,
  isOwnerOrAdmin
};
