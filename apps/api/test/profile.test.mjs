import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../dist/app.module.js';
import { migrate } from '../scripts/migrate.mjs';

const databaseUrl = process.env.TEST_DATABASE_URL;

test('ESM-06 mantém o perfil privado, oferece um check-in por dia e respeita a memória', {
  skip: !databaseUrl && 'Defina TEST_DATABASE_URL para testar com PostgreSQL.',
}, async (t) => {
  const admin = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
  const schema = 'profile_test_' + randomBytes(12).toString('hex');
  const scopedUrl = new URL(databaseUrl);
  scopedUrl.searchParams.set('options', '-c search_path=' + schema);
  const owner = randomBytes(32).toString('hex');
  const other = randomBytes(32).toString('hex');
  let system;
  let app;
  let schemaCreated = false;

  const provider = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    system = JSON.parse(body).messages[0].content;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: 'test', message: { content: 'Vamos refletir.' } }));
  });

  async function startApi() {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  }

  async function request(path, method = 'GET', token = owner, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch((await app.getUrl()) + '/api' + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async function chat(topic = 'work', token = owner) {
    const response = await request('/chat', 'POST', token, { locale: 'pt-BR', topic, message: 'Vamos conversar?' });
    assert.equal(response.status, 200);
    return system;
  }

  try {
    await admin.connect();
    await admin.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    await migrate(scopedUrl.toString());

    provider.listen(0, '127.0.0.1');
    await once(provider, 'listening');
    process.env.DATABASE_URL = scopedUrl.toString();
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:' + provider.address().port;
    process.env.OLLAMA_MODEL = 'test';
    delete process.env.CHAT_PERSONA_FILE;
    t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-24T02:59:59Z') });
    await startApi();

    const profile = { name: 'Ipê Azul', email: 'ipe@example.test', sex: 'other' };
    const profilePath = '/profile';
    const checkInPath = '/profile/check-in';
    const memoryPath = '/profile/memory';
    const offerPath = checkInPath + '/offer';
    assert.equal((await request(profilePath, 'GET', null)).status, 401);
    assert.equal((await request(profilePath, 'PUT', owner, { ...profile, email: 'invalid' })).status, 400);

    const sessionId = randomUUID();
    const previous = 'Primeiro rascunho do projeto Jacarandá';
    const saved = await request('/history/' + sessionId, 'PUT', owner, { topic: 'work', messages: [
      { role: 'user', content: previous }, { role: 'assistant', content: 'Conte mais.' },
    ] });
    assert.ok(saved.ok);
    await admin.query(`UPDATE ${schema}.chat_sessions SET updated_at = '2026-11-23T20:00:00Z' WHERE id = $1`, [sessionId]);

    assert.deepEqual(await (await request(profilePath, 'PUT', owner, profile)).json(), { profile });
    assert.deepEqual(await (await request(profilePath, 'GET', other)).json(), { profile: null });
    assert.equal((await (await request('/history')).json())[0].id, sessionId);
    assert.deepEqual(await (await request(memoryPath)).json(), { enabled: false });

    const offers = await Promise.all(Array.from({ length: 8 }, async () => {
      const response = await request(offerPath, 'POST');
      assert.equal(response.status, 200);
      return response.json();
    }));
    assert.equal(offers.filter(({ show }) => show).length, 1);
    assert.ok(offers.every(({ date }) => date === '2026-11-23'));
    assert.equal((await (await request(offerPath, 'POST', other)).json()).show, true);

    const answers = { date: '2026-11-23', mood: 'worried', topic: 'work' };
    assert.equal((await request(checkInPath, 'PUT', owner, { ...answers, mood: 'invalid' })).status, 400);
    assert.equal((await request(checkInPath, 'PUT', owner, answers)).status, 204);
    assert.equal((await request(checkInPath, 'PUT', owner, answers)).status, 204);
    assert.equal((await request(checkInPath, 'PUT', owner, { ...answers, mood: 'sad' })).status, 409);
    assert.match(await chat(), /"today":\{"mood":"worried","topic":"work"\}/);
    assert.doesNotMatch(system, /Jacarandá|Ipê Azul|example\.test/);
    assert.doesNotMatch(await chat('work', other), /worried|Jacarandá|Ipê Azul/);

    await app.close();
    app = undefined;
    await startApi();
    assert.deepEqual(await (await request(profilePath)).json(), { profile });
    assert.deepEqual(await (await request(offerPath, 'POST')).json(), { date: '2026-11-23', show: false });
    assert.deepEqual(await (await request(offerPath, 'POST', other)).json(), { date: '2026-11-23', show: false });

    t.mock.timers.setTime(new Date('2026-11-24T03:00:00Z').getTime());
    assert.deepEqual(await (await request(offerPath, 'POST')).json(), { date: '2026-11-24', show: true });
    assert.doesNotMatch(await chat(), /worried|Jacarandá|Ipê Azul/);
    assert.deepEqual(await (await request(memoryPath, 'PUT', owner, { enabled: true })).json(), { enabled: true });
    assert.match(await chat(), /Ipê Azul/);
    assert.match(system, /worried/);
    assert.match(system, /Jacarandá/);
    assert.doesNotMatch(system, /example\.test|"sex"/);
    assert.doesNotMatch(await chat('love'), /worried|Jacarandá/);

    assert.equal((await request(checkInPath, 'DELETE')).status, 204);
    assert.deepEqual(await (await request(offerPath, 'POST')).json(), { date: '2026-11-24', show: false });
    assert.equal((await request(checkInPath, 'PUT', owner, { ...answers, date: '2026-11-24' })).status, 409);
    assert.doesNotMatch(await chat(), /worried/);

    assert.equal((await request(memoryPath, 'PUT', owner, { enabled: false })).status, 200);
    assert.doesNotMatch(await chat(), /Jacarandá|Ipê Azul/);
    assert.equal((await (await request('/history')).json())[0].id, sessionId);
  } finally {
    await app?.close();
    if (provider.listening) {
      provider.closeAllConnections();
      await new Promise((resolve) => provider.close(resolve));
    }
    try {
      if (schemaCreated) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  }
});
