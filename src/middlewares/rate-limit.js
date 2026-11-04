/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const { rateLimit } = require('express-rate-limit');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                 Rate limits                                */
/* -------------------------------------------------------------------------- */

const limiter = (limit, options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },
    ...options,
  });

// Protects the database from request floods on every API route.
const apiLimiter = limiter(env.apiRateLimit);

// Slows down password guessing and email enumeration on public auth routes.
const authLimiter = limiter(env.authRateLimit);

// Slows down password guessing on one account from many addresses, which the
// per-IP limits above can't see. Counts failed sign-ins only, per email.
const loginAccountLimiter = limiter(env.loginAccountRateLimit, {
  keyGenerator: (req) => `login:${req.body.email.trim().toLowerCase()}`,
  skip: (req) => typeof req.body?.email !== 'string',
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message:
      'Too many failed sign-ins for this account, please try again later',
  },
});

module.exports = { apiLimiter, authLimiter, loginAccountLimiter };
