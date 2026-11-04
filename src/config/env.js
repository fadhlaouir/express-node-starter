/* -------------------------------------------------------------------------- */
/*                                Environment                                 */
/* -------------------------------------------------------------------------- */
// Reads every setting in one place. `npm start` and `npm run dev` load `.env`
// with Node's --env-file-if-exists; in production, set real environment variables.

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,

  // Database
  databaseUrl: isProduction
    ? process.env.PROD_DATABASE
    : process.env.DEV_DATABASE,

  // JSON Web Tokens
  jwtSecret: process.env.SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Front-end used in email links, and allowed CORS origins (comma-separated, or *)
  clientUrl: isProduction
    ? process.env.PRODUCTION_CLIENT_URL
    : process.env.DEVELOPMENT_CLIENT_URL,
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Rate limit for authentication routes: requests per IP per 15 minutes
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  // Rate limit for every API route: requests per IP per 15 minutes
  apiRateLimit: Number(process.env.API_RATE_LIMIT) || 300,
  // Failed sign-ins per account per 15 minutes, from any address
  loginAccountRateLimit: Number(process.env.LOGIN_ACCOUNT_RATE_LIMIT) || 10,

  // Mailer: emails are skipped (and logged outside production) when unset
  mailer: {
    user: process.env.MAILER_EMAIL_ID,
    password: process.env.MAILER_PASSWORD,
    service: process.env.MAILER_SERVICE_PROVIDER,
    host: process.env.HOST,
    port: Number(process.env.PORT_SSL) || 465,
    secure: process.env.SECURE !== 'false',
  },
};

/**
 * Fail fast on settings the API cannot run safely without.
 */
function assertRequiredEnv() {
  const missing = [];
  if (!env.databaseUrl) {
    missing.push(isProduction ? 'PROD_DATABASE' : 'DEV_DATABASE');
  }
  if (!env.jwtSecret) missing.push('SECRET');
  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`,
    );
  }
  if (isProduction && env.jwtSecret.length < 32) {
    throw new Error('SECRET must be at least 32 characters in production.');
  }
}

module.exports = { env, assertRequiredEnv };
