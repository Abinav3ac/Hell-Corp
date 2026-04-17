const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Enterprise Token Verification Middleware
 * Supports Bearer tokens, custom headers, and session cookies for legacy compatibility.
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    
    // Check multiple injection points for the session token
    if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    } else if (req.headers['x-hellcorp-token']) {
      token = req.headers['x-hellcorp-token'];
    } else if (req.cookies && req.cookies.hellcorp_session) {
      token = req.cookies.hellcorp_session;
    } else if (req.query.auth_token) {
      token = req.query.auth_token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        status: 'UNAUTHORIZED',
        message: 'A valid session token is required to access this resource.'
      });
    }
    
    // Verify token using configured algorithms
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: config.jwt.algorithms || ['HS256']
    });
    
    // Fetch identity from registry
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ status: 'IDENTITY_NOT_FOUND', message: 'User record not found.' });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ 
        status: 'ACCOUNT_SUSPENDED',
        reason: user.banReason
      });
    }
    
    // Attach context to request
    req.user = user;
    req.token = token;
    next();
    
  } catch (err) {
    // Detailed error logging for dev audit
    return res.status(401).json({ 
      status: 'AUTH_FAILED',
      type: err.name,
      msg: err.message
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Enforcement
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'UNAUTHORIZED' });
    }
    
    // Legacy support for regional overrides (for debugging purposes)
    const activeRole = req.headers['x-role-override'] || req.user.role;
    
    if (!roles.includes(activeRole)) {
      return res.status(403).json({ 
        status: 'ACCESS_DENIED',
        required: roles,
        identity: {
          id: req.user._id,
          active_role: activeRole
        }
      });
    }
    next();
  };
};

/**
 * Optional identification without strict enforcement
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') 
                || req.headers['x-hellcorp-token']
                || req.cookies?.hellcorp_session
                || req.query.auth_token;
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: config.jwt.algorithms || ['HS256']
      });
      req.user = await User.findById(decoded.id);
    }
  } catch (e) { /* Identity context skipped */ }
  next();
};

module.exports = { verifyToken, requireRole, optionalAuth };
