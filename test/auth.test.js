const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const {
  setup,
  teardown,
  createUser,
  login,
  lastEmailCode,
} = require('./setup');

let agent;
before(async () => {
  agent = request(await setup());
});
after(teardown);

test('sign-up ignores role and activation sent by the client', async () => {
  const email = 'attacker@example.com';
  const res = await agent.post('/v1/api/auth/register').send({
    email,
    password: 'password123',
    fullName: 'Attacker',
    role: 'is_admin',
    is_active: true,
  });
  assert.equal(res.status, 201);

  const User = require('../src/models/user.model');
  const user = await User.findOne({ email });
  assert.equal(user.role, 'is_user');
  assert.equal(user.is_active, false);
});

test('an account must be confirmed by email before signing in', async () => {
  const email = 'new@example.com';
  await agent
    .post('/v1/api/auth/register')
    .send({ email, password: 'password123', fullName: 'New User' })
    .expect(201);

  const before = await agent
    .post('/v1/api/auth/login')
    .send({ email, password: 'password123' });
  assert.equal(before.status, 403);

  await agent.post(`/v1/api/auth/confirm/${lastEmailCode()}`).expect(200);

  const token = await login(agent, email);
  assert.ok(token);
});

test('a confirmation code works only once', async () => {
  await agent
    .post('/v1/api/auth/register')
    .send({ email: 'once@example.com', password: 'password123' })
    .expect(201);
  const code = lastEmailCode();
  await agent.post(`/v1/api/auth/confirm/${code}`).expect(200);
  await agent.post(`/v1/api/auth/confirm/${code}`).expect(400);
});

test('the token holds only the user id and role', async () => {
  const user = await createUser();
  const token = await login(agent, user.email);
  const payload = jwt.decode(token);
  assert.deepEqual(Object.keys(payload).sort(), ['_id', 'exp', 'iat', 'role']);
  assert.equal(payload._id, user._id.toString());
});

test('wrong email and wrong password give the same answer', async () => {
  const user = await createUser();
  const wrongPassword = await agent
    .post('/v1/api/auth/login')
    .send({ email: user.email, password: 'not-the-password' });
  const unknownEmail = await agent
    .post('/v1/api/auth/login')
    .send({ email: 'nobody@example.com', password: 'whatever123' });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownEmail.status, 401);
  assert.equal(wrongPassword.body.message, unknownEmail.body.message);
});

test('query operators in the body are rejected (NoSQL injection)', async () => {
  await createUser();
  const res = await agent
    .post('/v1/api/auth/login')
    .send({ email: { $ne: null }, password: { $ne: null } });
  assert.equal(res.status, 422);
});

test('forgot password answers the same for unknown emails', async () => {
  const user = await createUser();
  const known = await agent
    .post('/v1/api/auth/forget-password')
    .send({ email: user.email });
  const unknown = await agent
    .post('/v1/api/auth/forget-password')
    .send({ email: 'nobody@example.com' });
  assert.equal(known.status, 200);
  assert.equal(unknown.status, 200);
  assert.equal(known.body.message, unknown.body.message);
});

test('a reset link sets a new password and works only once', async () => {
  const user = await createUser();
  await agent
    .post('/v1/api/auth/forget-password')
    .send({ email: user.email })
    .expect(200);
  const token = lastEmailCode();

  await agent
    .post(`/v1/api/auth/reset-password/${token}`)
    .send({ newPassword: 'brand-new-pass', verifyPassword: 'brand-new-pass' })
    .expect(200);

  assert.ok(await login(agent, user.email, 'brand-new-pass'));
  await agent
    .post(`/v1/api/auth/reset-password/${token}`)
    .send({ newPassword: 'another-pass1', verifyPassword: 'another-pass1' })
    .expect(400);
});

test('admin login refuses regular users', async () => {
  const user = await createUser();
  const res = await agent
    .post('/v1/api/auth/admin/login')
    .send({ email: user.email, password: 'password123' });
  assert.equal(res.status, 403);

  const admin = await createUser({ role: 'is_admin' });
  const ok = await agent
    .post('/v1/api/auth/admin/login')
    .send({ email: admin.email, password: 'password123' });
  assert.equal(ok.status, 200);
});

test('sign-up refuses an address that is not an email', async () => {
  for (const email of [
    'not-an-email',
    'a@b',
    'two@@example.com',
    'sp ace@example.com',
    `${'a'.repeat(250)}@example.com`,
  ]) {
    const res = await agent
      .post('/v1/api/auth/register')
      .send({ email, password: 'password123' });
    assert.equal(res.status, 422, email);
  }
});

test('sign-up refuses a password longer than bcrypt reads', async () => {
  // bcrypt reads 72 bytes: a longer password would match on its first 72 alone
  const res = await agent
    .post('/v1/api/auth/register')
    .send({ email: 'long@example.com', password: 'a'.repeat(73) });
  assert.equal(res.status, 422);
  // Bytes, not letters: 37 two-byte letters are 74 bytes
  const accented = await agent
    .post('/v1/api/auth/register')
    .send({ email: 'accent@example.com', password: 'é'.repeat(37) });
  assert.equal(accented.status, 422);
  await agent
    .post('/v1/api/auth/register')
    .send({ email: 'max@example.com', password: 'a'.repeat(72) })
    .expect(201);
});

test('an email is matched whatever its case', async () => {
  const user = await createUser({ email: 'mixed@example.com' });
  assert.ok(await login(agent, 'MiXeD@Example.COM'));
  assert.equal(user.email, 'mixed@example.com');
});
