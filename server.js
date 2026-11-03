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

  // Finish in-flight requests and close the database before exiting.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
