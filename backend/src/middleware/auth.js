const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT and attaches the corresponding Mongoose user document to req.user.
 * We look the user up in MongoDB (rather than trusting the decoded token payload
 * alone) so controllers can safely call document methods like .save() and
 * .markModified(), and so we always reflect the user's current state
 * (role changes, suspension, etc).
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify the VIP Pass using the shared secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Load the real Mongoose document so downstream code can use
    // document methods (save, markModified, etc).
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Token verification failed on Port 5000:", err.message);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * Restricts a route to specific roles.
 * UPDATED: Now case-insensitive to prevent 403 Forbidden errors when casing mismatches.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'User role missing from token' });
    }
    
    // Convert both the required roles and the user's role to lowercase for safe comparison
    const allowedRoles = roles.map(role => role.toLowerCase());
    const userRole = req.user.role.toLowerCase();
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };