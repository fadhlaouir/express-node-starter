/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');

/* -------------------------------------------------------------------------- */
/*                                  Database                                  */
/* -------------------------------------------------------------------------- */

/**
 * Connect to MongoDB.
 * @param {string} url - MongoDB connection string
 */
async function connectDatabase(url) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(url);
  console.log('Connected to the database');
}

/**
 * Close the MongoDB connection.
 */
async function disconnectDatabase() {
  await mongoose.disconnect();
}

/**
 * Whether the database connection is ready, for the health check.
 * @returns {boolean}
 */
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, disconnectDatabase, isDatabaseConnected };
