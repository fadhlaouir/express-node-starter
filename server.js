/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const { env, assertRequiredEnv } = require('./src/config/env');
const {
  connectDatabase,
  disconnectDatabase,
} = require('./src/config/database');

/* -------------------------------------------------------------------------- */
/*                                   Server                                   */
/* -------------------------------------------------------------------------- */
// Under Docker's 10 seconds before SIGKILL, so the exit is ours and logged
const SHUTDOWN_TIMEOUT = 8 * 1000;

/**
 * Check the configuration, connect to MongoDB, then start listening.
 */
async function start() {
  assertRequiredEnv();
  const app = require('./src/app');
  await connectDatabase(env.databaseUrl);

  const server = app.listen(env.port, () => {
    console.log(`Listening on PORT ${env.port}`);
  });

  // Finish in-flight requests and close the database before exiting. A client
  // that keeps its connection open can't hold the exit back past the timeout.
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);
    setTimeout(() => {
      console.error('Connections still open, exiting without waiting for them');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT).unref();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    server.closeIdleConnections();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
