/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Dependencies
const nodemailer = require('nodemailer');

// Environment variables
const {
  MAILER_EMAIL_ID: FROM_EMAIL,
  MAILER_PASSWORD: AUTH_PASSWORD,
  NODE_ENV,
  PRODUCTION_CLIENT_URL,
  DEVELOPMENT_CLIENT_URL,
  HOST,
  SECURE,
  PORT_SSL,
  MAILER_SERVICE_PROVIDER,
} = process.env;

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
// API endpoint
const API_ENDPOINT =
  NODE_ENV === 'production' ? PRODUCTION_CLIENT_URL : DEVELOPMENT_CLIENT_URL;

// SMTP transporter configuration
const smtpTransport = nodemailer.createTransport({
  host: HOST,
  port: PORT_SSL,
  secure: SECURE,
  service: MAILER_SERVICE_PROVIDER,
  auth: {
    user: FROM_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

/**
 * Send email using SMTP transporter
 * @param {Object} data - Email data including from, to, subject, and html
 * @returns {Promise} Promise indicating success or failure of email sending
 */
const sendEmail = (data) => {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(data, (err) => {
      if (err) reject(err); // Reject with error
      else resolve(); // Resolve if successful
    });
  });
};

// export module
module.exports = {
  API_ENDPOINT,
  smtpTransport,
  sendEmail,
};
