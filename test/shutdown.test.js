const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;
before(async () => {
  mongo = await MongoMemoryServer.create();
});
after(() => mongo?.stop());

/** A port nothing is listening on. */
const freePort = () =>
  new Promise((resolve) => {
    const probe = net.createServer().listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

// Windows has no SIGTERM to send a process: it would be killed at once.
test(
  'shutdown does not wait forever for a request that never finishes',
  { skip: process.platform === 'win32', timeout: 30_000 },
  async () => {
    const port = await freePort();
    const server = spawn(process.execPath, ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: String(port),
        DEV_DATABASE: mongo.getUri(),
        SECRET: 'test-secret-that-is-long-enough-for-hs256-signing',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await new Promise((resolve, reject) => {
      server.stdout.on('data', (chunk) => {
        if (String(chunk).includes('Listening')) resolve();
      });
      server.on('exit', () => reject(new Error('the server did not start')));
    });

    // A request whose body never arrives: in flight, and the server can't finish it
    const client = net.connect(port, '127.0.0.1');
    // The server dropping it on exit is the point, not an error
    client.on('error', () => {});
    await new Promise((resolve) => client.on('connect', resolve));
    client.write(
      'POST /v1/api/auth/login HTTP/1.1\r\nHost: localhost\r\n' +
        'Content-Type: application/json\r\nContent-Length: 100\r\n\r\n{"em',
    );

    const start = Date.now();
    const exited = new Promise((resolve) => server.on('exit', resolve));
    server.kill('SIGTERM');
    const code = await exited;
    client.destroy();

    assert.equal(code, 1);
    assert.ok(Date.now() - start < 12_000, 'exited within the timeout');
  },
);
