/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                Verify token                                */
/* -------------------------------------------------------------------------- */

/**
 * Require a valid JWT, sent as `Authorization: Bearer <token>` (or the legacy
 * `x-access-token` header). Sets `req.decoded` to `{ _id, role }`.
 */
module.exports = function verifyToken(req, res, next) {
  let token = req.headers.authorization || req.headers['x-access-token'];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' });
  }
  if (token.startsWith('Bearer ')) token = token.slice('Bearer '.length);

  try {
    req.decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    return next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
