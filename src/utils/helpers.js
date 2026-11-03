/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const nodemailer = require('nodemailer');
const { env } = require('../config/env');

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

// Front-end URL used in email links
const API_ENDPOINT = env.clientUrl;

const { mailer } = env;
const isMailerConfigured = Boolean(mailer.user && mailer.password);

// The transporter is created only when the mailer is configured.
const smtpTransport = isMailerConfigured
  ? nodemailer.createTransport({
      host: mailer.host,
      port: mailer.port,
      secure: mailer.secure,
      service: mailer.service,
      auth: { user: mailer.user, pass: mailer.password },
    })
  : null;

// In tests, sent emails are kept here so tests can read the links they contain.
const outbox = [];

/**
 * Send an email. Without a configured mailer, the email is skipped; outside
 * production its subject and recipient are logged so you can test locally.
 * @param {{ to: string, subject: string, html: string }} data
 * @returns {Promise<void>}
 */
const sendEmail = async (data) => {
  if (env.isTest) {
    outbox.push(data);
    return;
  }
  if (!smtpTransport) {
    if (!env.isProduction && !env.isTest) {
      const link = /href="([^"]+)"/.exec(data.html)?.[1];
      console.log(
        `[mailer not configured] "${data.subject}" to ${data.to}${link ? `: ${link}` : ''}`,
      );
    }
    return;
  }
  await smtpTransport.sendMail({ from: mailer.user, ...data });
};

module.exports = {
  API_ENDPOINT,
  smtpTransport,
  sendEmail,
  outbox,
};
