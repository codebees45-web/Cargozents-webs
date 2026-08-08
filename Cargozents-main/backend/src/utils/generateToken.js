const jwt = require('jsonwebtoken');

/**
 * Signs a JWT carrying the minimum needed to authorize requests:
 * user id and role. Role is embedded so middleware can gate routes
 * (e.g. admin-only) without a DB lookup on every request.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
