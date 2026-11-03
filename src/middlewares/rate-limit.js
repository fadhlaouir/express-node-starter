/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const { rateLimit } = require('express-rate-limit');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                 Rate limits                                */
/* -------------------------------------------------------------------------- */

const limiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },
  });

// Protects the database from request floods on every API route.
const apiLimiter = limiter(env.apiRateLimit);

// Slows down password guessing and email enumeration on public auth routes.
const authLimiter = limiter(env.authRateLimit);

module.exports = { apiLimiter, authLimiter };
