/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Local
const { env } = require('./config/env');
const { isDatabaseConnected } = require('./config/database');
const { UPLOAD_DIR } = require('./middlewares/multer');
const { notFound, errorHandler } = require('./middlewares/error-handler');
const routes = require('./routes');
const docs = require('./docs');

/* -------------------------------------------------------------------------- */
/*                                     App                                    */
/* -------------------------------------------------------------------------- */
const app = express();

// Behind a proxy (Render, Railway, Nginx…), trust it so rate limits see real IPs.
if (env.isProduction) app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      env.corsOrigin === '*'
        ? '*'
        : env.corsOrigin.split(',').map((origin) => origin.trim()),
  }),
);
if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Uploaded files. express.static refuses paths outside the folder.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(UPLOAD_DIR, { dotfiles: 'deny', index: false }),
);

// Root: where to go next
app.get('/', (req, res) =>
  res.json({
    name: 'Express Node Starter API',
    docs: '/api-docs/',
    health: '/health',
    api: '/v1/api',
  }),
);

// Health check for load balancers and uptime monitors
app.get('/health', (req, res) => {
  const database = isDatabaseConnected();
  res
    .status(database ? 200 : 503)
    .json({ status: database ? 'ok' : 'degraded', database });
});

// API documentation (Swagger UI) at /api-docs
app.use('/api-docs', docs);

// API routes
app.use('/v1/api', routes);

// Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
