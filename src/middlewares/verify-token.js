/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/user.model');

/* -------------------------------------------------------------------------- */
/*                                Verify token                                */
/* -------------------------------------------------------------------------- */

const refuse = (res, message) =>
  res.status(401).json({ success: false, message });

/**
 * Require a valid JWT, sent as `Authorization: Bearer <token>` (or the legacy
 * `x-access-token` header). Sets `req.decoded` to `{ _id, role }`.
 *
 * A signed token is not enough on its own: the account must still exist and be
 * active, and the token must be newer than its last password change, so that
 * deleting, deactivating or changing the password of an account signs it out
 * everywhere. The role comes from the database, so a role change applies at once.
 */
module.exports = async function verifyToken(req, res, next) {
  let token = req.headers.authorization || req.headers['x-access-token'];

  if (!token) return refuse(res, 'No token provided');
  if (token.startsWith('Bearer ')) token = token.slice('Bearer '.length);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return refuse(res, 'Invalid or expired token');
  }

  const user = await User.findById(payload._id)
    .select('role is_active +passwordChangedAt')
    .lean();
  // `iat` is in whole seconds: a token from the second of the change still counts
  const changedAt = user?.passwordChangedAt
    ? Math.floor(user.passwordChangedAt.getTime() / 1000)
    : 0;
  if (!user || !user.is_active || payload.iat < changedAt) {
    return refuse(res, 'Your session has ended, please sign in again');
  }

  req.decoded = { _id: payload._id, role: user.role };
  return next();
};
