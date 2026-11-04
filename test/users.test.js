const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown, createUser, login } = require('./setup');

let agent;
before(async () => {
  agent = request(await setup());
});
after(teardown);

const auth = (token) => ({ Authorization: `Bearer ${token}` });

/**
 * A token signed ten seconds ago: tokens count in whole seconds, and one from the
 * same second as a password change is still accepted.
 * @param {import('mongoose').Document} user
 */
const earlierToken = (user) =>
  require('jsonwebtoken').sign(
    {
      _id: user._id.toString(),
      role: user.role,
      iat: Math.floor(Date.now() / 1000) - 10,
    },
    process.env.SECRET,
    { algorithm: 'HS256', expiresIn: '1h' },
  );

test('changing the password signs out other sessions, not this one', async () => {
  const user = await createUser();
  const other = earlierToken(user);
  const res = await agent
    .put('/v1/api/users/me/password')
    .set(auth(other))
    .send({ currentPassword: 'password123', newPassword: 'a-new-password' })
    .expect(200);
  await agent.get('/v1/api/users/me').set(auth(other)).expect(401);
  await agent.get('/v1/api/users/me').set(auth(res.body.token)).expect(200);
});

test('resetting the password signs out every session', async () => {
  const user = await createUser();
  const stolen = earlierToken(user);
  await agent.get('/v1/api/users/me').set(auth(stolen)).expect(200);

  await agent
    .post('/v1/api/auth/forget-password')
    .send({ email: user.email })
    .expect(200);
  const { lastEmailCode } = require('./setup');
  await agent
    .post(`/v1/api/auth/reset-password/${lastEmailCode()}`)
    .send({ newPassword: 'reset-password', verifyPassword: 'reset-password' })
    .expect(200);

  await agent.get('/v1/api/users/me').set(auth(stolen)).expect(401);
});

test('a deactivated or deleted account is signed out at once', async () => {
  const User = require('../src/models/user.model');
  const deactivated = await createUser();
  const deactivatedToken = await login(agent, deactivated.email);
  await User.updateOne({ _id: deactivated._id }, { is_active: false });
  await agent.get('/v1/api/users/me').set(auth(deactivatedToken)).expect(401);

  const deleted = await createUser();
  const deletedToken = await login(agent, deleted.email);
  await User.deleteOne({ _id: deleted._id });
  await agent.get('/v1/api/users/me').set(auth(deletedToken)).expect(401);
});

test('a role taken away applies at once, without a new sign-in', async () => {
  const User = require('../src/models/user.model');
  const manager = await createUser({ role: 'is_manager' });
  const token = await login(agent, manager.email);
  await agent.get('/v1/api/users').set(auth(token)).expect(200);

  await User.updateOne({ _id: manager._id }, { role: 'is_user' });
  await agent.get('/v1/api/users').set(auth(token)).expect(403);
});

test('user routes require a token', async () => {
  const user = await createUser();
  await agent.get(`/v1/api/users/${user._id}`).expect(401);
  await agent.get('/v1/api/users/me').expect(401);
});

test('responses never contain password hashes', async () => {
  const user = await createUser();
  const token = await login(agent, user.email);
  const res = await agent.get('/v1/api/users/me').set(auth(token)).expect(200);
  assert.equal(res.body.user.password, undefined);
  assert.equal(res.body.user.email, user.email);
});

test('only staff can list users, with pagination', async () => {
  const user = await createUser();
  const userToken = await login(agent, user.email);
  await agent.get('/v1/api/users').set(auth(userToken)).expect(403);

  const admin = await createUser({ role: 'is_admin' });
  const adminToken = await login(agent, admin.email);
  const res = await agent
    .get('/v1/api/users?page=1&limit=2')
    .set(auth(adminToken))
    .expect(200);
  assert.equal(res.body.users.length, 2);
  assert.equal(res.body.pagination.limit, 2);
  assert.ok(res.body.users.every((u) => u.password === undefined));
});

test('a user cannot read, update or delete another user', async () => {
  const alice = await createUser();
  const bob = await createUser();
  const token = await login(agent, alice.email);

  await agent.get(`/v1/api/users/${bob._id}`).set(auth(token)).expect(403);
  await agent
    .put(`/v1/api/users/${bob._id}`)
    .set(auth(token))
    .send({ fullName: 'Hacked' })
    .expect(403);
  await agent.delete(`/v1/api/users/${bob._id}`).set(auth(token)).expect(403);
});

test('a user cannot make themselves admin', async () => {
  const user = await createUser();
  const token = await login(agent, user.email);
  const res = await agent
    .put(`/v1/api/users/${user._id}`)
    .set(auth(token))
    .send({ fullName: 'Renamed', role: 'is_admin', password: 'plaintext!' })
    .expect(200);
  assert.equal(res.body.user.fullName, 'Renamed');
  assert.equal(res.body.user.role, 'is_user');

  // The password didn't change through this route.
  assert.ok(await login(agent, user.email, 'password123'));
});

test('an admin can change a role', async () => {
  const user = await createUser();
  const admin = await createUser({ role: 'is_admin' });
  const token = await login(agent, admin.email);
  const res = await agent
    .put(`/v1/api/users/${user._id}`)
    .set(auth(token))
    .send({ role: 'is_manager' })
    .expect(200);
  assert.equal(res.body.user.role, 'is_manager');
});

test('changing a password requires the current one', async () => {
  const user = await createUser();
  const token = await login(agent, user.email);
  await agent
    .put('/v1/api/users/me/password')
    .set(auth(token))
    .send({ currentPassword: 'wrong-password', newPassword: 'new-password1' })
    .expect(401);
  await agent
    .put('/v1/api/users/me/password')
    .set(auth(token))
    .send({ currentPassword: 'password123', newPassword: 'new-password1' })
    .expect(200);
  assert.ok(await login(agent, user.email, 'new-password1'));
});

test('a user can delete their own account', async () => {
  const user = await createUser();
  const token = await login(agent, user.email);
  await agent.delete(`/v1/api/users/${user._id}`).set(auth(token)).expect(200);
  // The account is gone, and its token with it
  await agent.get('/v1/api/users/me').set(auth(token)).expect(401);
});

test('an invalid id is a 400, not a server error', async () => {
  const admin = await createUser({ role: 'is_admin' });
  const token = await login(agent, admin.email);
  await agent.get('/v1/api/users/not-an-id').set(auth(token)).expect(400);
});
