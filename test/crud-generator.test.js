// Generates a real CRUD into src/, exercises its routes, then deletes it.

const { test, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const request = require('supertest');
const { generate } = require('../cli');
const { deleteCrud } = require('../cli/_/deleteCrud');
const { entityFiles, validateEntityName } = require('../cli/_/helpers');
const { setup, teardown, createUser, login } = require('./setup');

// The generator reports what it writes on the console. Keep that out of the test
// runner's own output, which Node 22 can misread ("Unable to deserialize cloned data").
mock.method(console, 'log', () => {});

const ENTITY = 'zzgadget';
let agent;

before(async () => {
  await deleteCrud(ENTITY);
  await generate(ENTITY, 'minimal');
  agent = request(await setup());
});
after(async () => {
  await deleteCrud(ENTITY);
  await teardown();
});

test('generated routes work end to end', async () => {
  const user = await createUser();
  const auth = { Authorization: `Bearer ${await login(agent, user.email)}` };

  await agent.post(`/v1/api/${ENTITY}s`).send({ name: 'No token' }).expect(401);

  const created = await agent
    .post(`/v1/api/${ENTITY}s`)
    .set(auth)
    .send({ name: 'First', description: 'One', extra: 'ignored' })
    .expect(201);
  const id = created.body[ENTITY]._id;
  assert.equal(created.body[ENTITY].extra, undefined);

  const list = await agent.get(`/v1/api/${ENTITY}s`).expect(200);
  assert.equal(list.body.pagination.total, 1);

  await agent
    .put(`/v1/api/${ENTITY}s/${id}`)
    .set(auth)
    .send({ name: 'Renamed' })
    .expect(200);
  const one = await agent.get(`/v1/api/${ENTITY}s/${id}`).expect(200);
  assert.equal(one.body[ENTITY].name, 'Renamed');
  assert.equal(one.body[ENTITY].description, 'One');

  await agent.delete(`/v1/api/${ENTITY}s/${id}`).set(auth).expect(200);
  await agent.get(`/v1/api/${ENTITY}s/${id}`).expect(404);
});

test('the generator refuses to overwrite existing files', async () => {
  await assert.rejects(generate(ENTITY, 'minimal'), /already exist/);
});

test('entity names that could escape src/ are rejected', () => {
  for (const name of ['../evil', 'a/b', '..', '', '1abc', 'a b']) {
    assert.throws(() => validateEntityName(name), /Entity name/, name);
  }
  assert.equal(validateEntityName(' product '), 'product');
});

test('delete removes every generated file', async () => {
  await deleteCrud('zzother');
  await generate('zzother', 'empty');
  const files = Object.values(entityFiles('zzother'));
  assert.ok(files.every((file) => fs.existsSync(file)));
  await deleteCrud('zzother');
  assert.ok(files.every((file) => !fs.existsSync(file)));
});
