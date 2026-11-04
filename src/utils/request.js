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

// The longest address SMTP can deliver to (RFC 5321)
const MAX_EMAIL_LENGTH = 254;
// One @, something on each side, a dot in the domain, no spaces
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// bcrypt reads only the first 72 bytes: longer passwords would match on that prefix alone
const MAX_PASSWORD_BYTES = 72;

/**
 * Read an email address, lower-cased.
 * @param {*} value
 * @param {string} [name]
 * @returns {string}
 */
function readEmail(value, name = 'email') {
  const email = readString(value, name, { required: true }).toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(422, `${name} must be a valid email address`);
  }
  return email;
}

/**
 * Read a password, enforcing a minimum length and bcrypt's maximum.
 * @param {*} value
 * @param {string} [name]
 * @returns {string}
 */
function readPassword(value, name = 'password') {
  const password = readString(value, name, { required: true });
  if (password.length < 8) {
    throw new HttpError(422, `${name} must be at least 8 characters`);
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    throw new HttpError(
      422,
      `${name} must be at most ${MAX_PASSWORD_BYTES} bytes (72 letters, fewer with accents or emoji)`,
    );
  }
  return password;
}

module.exports = { HttpError, readString, readEmail, readPassword };
