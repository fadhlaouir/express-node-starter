/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const { rateLimit } = require('express-rate-limit');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                 Rate limits                                */
/* -------------------------------------------------------------------------- */

// Slows down password guessing and email enumeration on public auth routes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.authRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

module.exports = { authLimiter };
