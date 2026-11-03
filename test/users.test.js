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
  await agent.get('/v1/api/users/me').set(auth(token)).expect(404);
});

test('an invalid id is a 400, not a server error', async () => {
  const admin = await createUser({ role: 'is_admin' });
  const token = await login(agent, admin.email);
  await agent.get('/v1/api/users/not-an-id').set(auth(token)).expect(400);
});
