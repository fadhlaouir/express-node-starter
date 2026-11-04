/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                    Token                                   */
/* -------------------------------------------------------------------------- */

/**
 * Sign a token with only what the API needs: never the whole user document.
 * @param {import('mongoose').Document} user
 * @returns {string}
 */
const signToken = (user) =>
  jwt.sign({ _id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });

module.exports = { signToken };
