/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                Error handlers                              */
/* -------------------------------------------------------------------------- */

/**
 * 404 for routes that don't exist.
 */
const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' });

/**
 * Turn any error into a JSON response. Express 5 forwards errors thrown in
 * async controllers here. Internal details are never sent in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  // Matched by name so the handler works in projects without multer.
  if (err.name === 'MulterError') {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
  } else if (err.name === 'ValidationError') {
    status = 422;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 409;
    message = 'This value is already in use';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }

  if (status >= 500) {
    if (!env.isTest) console.error(err);
    if (env.isProduction) message = 'Something went wrong';
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
