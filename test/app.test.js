const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown } = require('./setup');

let agent;
before(async () => {
  agent = request(await setup());
});
after(teardown);

test('health check reports the database', async () => {
  const res = await agent.get('/health').expect(200);
  assert.deepEqual(res.body, { status: 'ok', database: true });
});

test('uploads cannot read files outside the upload folder', async () => {
  for (const path of [
    '/uploads/..%2Fpackage.json',
    '/uploads/..%2F..%2Fpackage.json',
    '/uploads/%2e%2e/package.json',
  ]) {
    const res = await agent.get(path);
    assert.notEqual(res.status, 200, path);
    assert.ok(!res.text.includes('"dependencies"'), path);
  }
});

test('sign-up rejects files that are not images', async () => {
  const res = await agent
    .post('/v1/api/auth/register')
    .field('email', 'upload@example.com')
    .field('password', 'password123')
    .attach('photo', Buffer.from('<script>alert(1)</script>'), {
      filename: 'evil.html',
      contentType: 'text/html',
    });
  assert.equal(res.status, 422);
});

test('uploads over 5 MB are rejected with 413', async () => {
  const res = await agent
    .post('/v1/api/auth/register')
    .field('email', 'big@example.com')
    .field('password', 'password123')
    .attach('photo', Buffer.alloc(5 * 1024 * 1024 + 1), {
      filename: 'big.png',
      contentType: 'image/png',
    });
  assert.equal(res.status, 413);
});

test('sign-up stores an image under a random name', async () => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  await agent
    .post('/v1/api/auth/register')
    .field('email', 'photo@example.com')
    .field('password', 'password123')
    .attach('photo', png, {
      filename: '../../evil.png',
      contentType: 'image/png',
    })
    .expect(201);

  const User = require('../src/models/user.model');
  const user = await User.findOne({ email: 'photo@example.com' });
  assert.match(user.photo, /^uploads\/[0-9a-f-]{36}\.png$/);
  await agent.get(`/${user.photo}`).expect(200);

  const { removeUpload } = require('../src/middlewares/multer');
  await removeUpload(user.photo);
});

test('API docs load Swagger UI with integrity hashes and serve the spec', async () => {
  await agent.get('/api-docs').expect(301);
  const page = await agent.get('/api-docs/').expect(200);
  assert.match(page.text, /integrity="sha384-/);
  assert.match(
    page.headers['content-security-policy'],
    /script-src 'self' https:\/\/cdn\.jsdelivr\.net/,
  );
  const spec = await agent.get('/api-docs/openapi.json').expect(200);
  assert.equal(spec.body.openapi, '3.0.3');
});

test('unknown routes return a JSON 404', async () => {
  const res = await agent.get('/v1/api/nope').expect(404);
  assert.equal(res.body.success, false);
});

test('security headers are set', async () => {
  const res = await agent.get('/health');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-powered-by'], undefined);
});
