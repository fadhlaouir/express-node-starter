/* -------------------------------------------------------------------------- */
/*                               Request helpers                              */
/* -------------------------------------------------------------------------- */

/**
 * An error with an HTTP status, handled by the error middleware.
 */
class HttpError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Message returned to the client
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Read a request field as a trimmed string. Rejects objects and arrays, which
 * would otherwise reach MongoDB as query operators such as { "$ne": null }.
 * @param {*} value - Raw value from the request
 * @param {string} name - Field name, for the error message
 * @param {{ required?: boolean }} [options]
 * @returns {string|undefined}
 */
function readString(value, name, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(422, `${name} is required`);
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new HttpError(422, `${name} must be a string`);
  }
  return value.trim();
}

/**
 * Read a password, enforcing a minimum length.
 * @param {*} value
 * @param {string} [name]
 * @returns {string}
 */
function readPassword(value, name = 'password') {
  const password = readString(value, name, { required: true });
  if (password.length < 8) {
    throw new HttpError(422, `${name} must be at least 8 characters`);
  }
  return password;
}

module.exports = { HttpError, readString, readPassword };
