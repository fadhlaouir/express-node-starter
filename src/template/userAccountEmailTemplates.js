/* -------------------------------------------------------------------------- */
/*                               Email templates                              */
/* -------------------------------------------------------------------------- */

/**
 * Escape text before inserting it into HTML. Names come from users.
 * @param {string} value
 * @returns {string}
 */
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Shared layout for every email.
 * @param {string} title - Email title
 * @param {string} body - Inner HTML, already escaped
 * @returns {string}
 */
const layout = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
    .container { background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
    h1, p { margin: 0 0 12px; }
    a.button { display: inline-block; margin: 8px 0 16px; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">${body}</div>
</body>
</html>
`;

/**
 * Email sent after sign-up, to confirm the address and activate the account.
 * The link opens your front end, which calls POST /v1/api/auth/confirm/:code.
 * @param {string} fullName - User full name
 * @param {string} clientUrl - Front-end URL
 * @param {string} email - User email
 * @param {string} confirmationCode - Code sent to the user
 */
const singUpConfirmationEmailTemplate = (
  fullName,
  clientUrl,
  email,
  confirmationCode,
) =>
  layout(
    'Confirm your account',
    `
    <h1>Hello ${escapeHtml(fullName || email)},</h1>
    <p>Thanks for signing up. Your username is ${escapeHtml(email)}.</p>
    <p>Follow this link to activate your account:</p>
    <a class="button" href="${clientUrl}/account/${confirmationCode}/enable">Activate my account</a>
  `,
  );

/**
 * Email with a link to reset the password. The link expires after one hour.
 * The link opens your front end, which calls POST /v1/api/auth/reset-password/:token.
 * @param {string} fullName - User full name
 * @param {string} email - User email
 * @param {string} clientUrl - Front-end URL
 * @param {string} token - Reset token sent to the user
 */
const forgotPasswordEmailTemplate = (fullName, email, clientUrl, token) =>
  layout(
    'Reset your password',
    `
    <h1>Hello ${escapeHtml(fullName || email)},</h1>
    <p>We received a request to reset the password of ${escapeHtml(email)}.</p>
    <p>This link expires in one hour:</p>
    <a class="button" href="${clientUrl}/auth/reset-password/${token}">Reset my password</a>
    <p>If you didn't ask for this, you can ignore this email.</p>
  `,
  );

/**
 * Email confirming that the password was changed.
 * @param {string} fullName - User full name
 */
const resetPasswordConfirmationEmailTemplate = (fullName) =>
  layout(
    'Your password was changed',
    `
    <h1>Hello ${escapeHtml(fullName)},</h1>
    <p>Your password was changed. You can now sign in with your new password.</p>
    <p>If you didn't do this, reset your password now and contact us.</p>
  `,
  );

module.exports = {
  escapeHtml,
  singUpConfirmationEmailTemplate,
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
};
