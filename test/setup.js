// Starts an in-memory MongoDB and loads the app with test settings.
// Each test file calls setup() in `before` and teardown() in `after`.

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

async function setup() {
  mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.DEV_DATABASE = mongo.getUri();
  process.env.SECRET = 'test-secret-that-is-long-enough-for-hs256-signing';
  process.env.AUTH_RATE_LIMIT = '1000';
  process.env.API_RATE_LIMIT = '1000';
  process.env.DEVELOPMENT_CLIENT_URL = 'http://client.test';

  const { connectDatabase } = require('../src/config/database');
  await connectDatabase(process.env.DEV_DATABASE);
  return require('../src/app');
}

async function teardown() {
  const { disconnectDatabase } = require('../src/config/database');
  await disconnectDatabase();
  await mongo?.stop();
}

/**
 * Create a user directly in the database.
 * @param {object} fields
 */
async function createUser(fields = {}) {
  const User = require('../src/models/user.model');
  return User.create({
    email: `user${Date.now()}${Math.random()}@example.com`,
    password: 'password123',
    fullName: 'Test User',
    is_active: true,
    ...fields,
  });
}

/**
 * Sign in and return the token.
 * @param {import('supertest').SuperTest} agent
 * @param {string} email
 * @param {string} [password]
 */
async function login(agent, email, password = 'password123') {
  const res = await agent.post('/v1/api/auth/login').send({ email, password });
  return res.body.token;
}

/**
 * The code at the end of the last email's link.
 */
function lastEmailCode() {
  const { outbox } = require('../src/utils/helpers');
  const html = outbox.at(-1).html;
  return /\/([a-f0-9]{64})(?:\/enable)?"/.exec(html)[1];
}

module.exports = { setup, teardown, createUser, login, lastEmailCode };
