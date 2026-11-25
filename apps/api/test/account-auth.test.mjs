import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../dist/app.module.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { ConsultationMemory } from '../dist/profile/application/consultation-memory.js';
import { migrate } from '../scripts/migrate.mjs';

const databaseUrl = process.env.TEST_DATABASE_URL;

test('ESM-06 cadastra, autentica em outro aparelho e restringe os dados à sessão válida', {
  skip: !databaseUrl && 'Defina TEST_DATABASE_URL para testar com PostgreSQL.',
}, async () => {
  const admin = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
  const schema = 'auth_test_' + randomBytes(12).toString('hex');
  const scopedUrl = new URL(databaseUrl);
  scopedUrl.searchParams.set('options', '-c search_path=' + schema);
  const previousUrl = process.env.DATABASE_URL;
  const previousMode = process.env.REQUIRE_ACCOUNT;
  const visitor = randomBytes(32).toString('hex');
  const other = randomBytes(32).toString('hex');
  const id = randomUUID();
  const profile = { name: 'Ipê Azul', email: 'Ipe@example.test', sex: null };
  const password = 'Senha123';
  let app;
  let schemaCreated = false;
  const modelCalls = [];
  const provider = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const call = JSON.parse(body);
    modelCalls.push(call);
    const tool = call.tools?.find(({ function: fn }) => fn.name === 'remember_profile_fact');
    const message = tool ? { content: '', tool_calls: [{ function: {
      name: tool.function.name, arguments: { kind: 'occupation' },
    } }] } : { content: 'Vamos pensar num próximo passo.' };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: 'test', message }));
  });

  async function startApi() {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  }

  async function request(path, method = 'GET', token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch((await app.getUrl()) + '/api' + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  try {
    await admin.connect();
    await admin.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    await migrate(scopedUrl.toString());
    process.env.DATABASE_URL = scopedUrl.toString();
    await startApi();

    assert.equal((await request('/profile')).status, 401);
    assert.equal((await request('/profile', 'PUT', visitor, profile)).status, 200);
    assert.equal((await request('/history/' + id, 'PUT', visitor, { topic: 'work', messages: [
      { role: 'user', content: 'Pergunta de antes da conta' }, { role: 'assistant', content: 'Resposta anterior' },
    ] })).status, 200);
    const daily = await request('/tarot/daily', 'POST', visitor);
    assert.equal(daily.status, 200);
    const savedDraw = await daily.json();
    const offer = await (await request('/profile/check-in/offer', 'POST', visitor)).json();
    assert.ok(offer.show);
    assert.equal((await request('/profile/memory', 'PUT', visitor, { enabled: true })).status, 200);

    assert.equal((await request('/auth/register', 'POST', null, { ...profile, password })).status, 401);
    for (const invalid of ['Senha12', 'Senha1234']) {
      assert.equal((await request('/auth/register', 'POST', visitor, { ...profile, password: invalid })).status, 400);
    }
    const registered = await request('/auth/register', 'POST', visitor, { ...profile, password });
    assert.equal(registered.status, 201);
    assert.equal(registered.headers.get('Cache-Control'), 'no-store');
    const { token: firstToken } = await registered.json();
    assert.match(firstToken, /^a_[a-f0-9]{64}$/);
    assert.equal((await request('/auth/register', 'POST', other, { ...profile, email: profile.email.toUpperCase(), password })).status, 409);
    assert.equal((await request('/auth/register', 'POST', firstToken, { ...profile, password })).status, 401);

    for (const path of ['/profile', '/profile/memory', '/history', '/history/' + id, '/tarot/daily']) {
      assert.equal((await request(path, 'GET', visitor)).status, 401);
    }
    const chat = { locale: 'pt-BR', topic: 'work', message: 'Quero refletir.' };
    assert.equal((await request('/chat', 'POST', visitor, chat)).status, 401);
    assert.equal((await request('/chat', 'POST', 'a_' + other, chat)).status, 401);
    assert.equal((await request('/history/' + id, 'GET', other)).status, 404);
    assert.equal((await request('/auth/logout', 'POST', other)).status, 401);

    assert.deepEqual(await (await request('/profile', 'GET', firstToken)).json(), {
      profile: { ...profile, email: profile.email.toLowerCase() },
    });
    assert.equal((await request('/profile', 'PUT', firstToken, { ...profile, name: 'Ipê', email: 'another@example.test' })).status, 200);
    assert.equal((await (await request('/profile', 'GET', firstToken)).json()).profile.email, profile.email.toLowerCase());
    assert.deepEqual(await (await request('/tarot/daily', 'GET', firstToken)).json(), savedDraw);
    assert.deepEqual(await (await request('/profile/memory', 'GET', firstToken)).json(), { enabled: true });
    assert.deepEqual(await (await request('/profile/check-in/offer', 'POST', firstToken)).json(), { ...offer, show: false });

    const unknown = await request('/auth/login', 'POST', null, { email: 'unknown@example.test', password });
    const wrong = await request('/auth/login', 'POST', null, { email: profile.email, password: 'errada' });
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.deepEqual(await unknown.json(), await wrong.json());

    await app.close();
    app = undefined;
    await startApi();
    assert.equal((await request('/history/' + id, 'GET', firstToken)).status, 200);
    const loggedIn = await request('/auth/login', 'POST', null, { email: '  ' + profile.email.toUpperCase() + ' ', password });
    assert.equal(loggedIn.status, 200);
    const { token: secondToken } = await loggedIn.json();
    assert.notEqual(secondToken, firstToken);
    assert.equal((await (await request('/history/' + id, 'GET', secondToken)).json()).title, 'Pergunta de antes da conta');

    process.env.REQUIRE_ACCOUNT = '1';
    provider.listen(0, '127.0.0.1');
    await once(provider, 'listening');
    process.env.OLLAMA_MODEL = 'test';
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:' + provider.address().port;
    assert.equal((await request('/chat', 'POST', undefined, chat)).status, 401);
    assert.equal((await request('/chat', 'POST', other, chat)).status, 401);
    assert.equal((await request('/tarot/daily', 'GET', other)).status, 401);
    const jobQuestion = { ...chat, message: 'Trabalho como desenvolvedora. Quero refletir sobre a carreira.' };
    assert.equal((await request('/chat', 'POST', secondToken, jobQuestion)).status, 200);
    assert.ok(!modelCalls.at(-1).tools.some(({ function: fn }) => fn.name === 'remember_profile_fact'));
    const learning = '/profile/memory/learning';
    assert.deepEqual(await (await request(learning, 'GET', secondToken)).json(), { enabled: false, items: [] });
    assert.equal((await request(learning, 'PUT', secondToken, { enabled: true })).status, 200);
    const learned = await request('/chat', 'POST', secondToken, jobQuestion);
    assert.deepEqual(await learned.json(), { reply: 'Vamos pensar num próximo passo.', model: 'test' });
    assert.equal(modelCalls.at(-1).messages.at(-1).tool_name, 'remember_profile_fact');
    assert.deepEqual(await (await request(learning, 'GET', firstToken)).json(), {
      enabled: true, items: [{ kind: 'occupation', value: 'desenvolvedora' }],
    });
    assert.equal((await request('/chat', 'POST', firstToken, chat)).status, 200);
    assert.match(modelCalls.at(-1).messages[0].content, /"learned":\[\{"kind":"occupation","value":"desenvolvedora"\}\]/);
    const owner = createHash('sha256').update(visitor).digest('hex');
    const pending = await app.get(ConsultationMemory).propose(owner, 'Quero mudar de emprego.');
    assert.equal(pending?.kind, 'career_goal');
    assert.equal((await request(learning, 'PUT', secondToken, { enabled: false })).status, 200);
    assert.equal(await pending.accept(), false);
    assert.deepEqual(await (await request(learning, 'GET', secondToken)).json(), { enabled: false, items: [] });
    assert.equal((await request('/chat', 'POST', firstToken, chat)).status, 200);
    assert.doesNotMatch(modelCalls.at(-1).messages[0].content, /desenvolvedora/);

    const { rows: [account] } = await admin.query(`SELECT password_hash AS digest, password_salt AS salt FROM ${schema}.accounts`);
    assert.equal(account.digest.length, 64);
    assert.equal(account.salt.length, 16);
    assert.notEqual(account.digest.toString(), password);

    assert.equal((await request('/auth/logout', 'POST', firstToken)).status, 204);
    assert.equal((await request('/profile', 'GET', firstToken)).status, 401);
    assert.equal((await request('/profile', 'GET', secondToken)).status, 200);
    const secondHash = createHash('sha256').update(secondToken).digest('hex');
    await admin.query(`UPDATE ${schema}.account_sessions SET expires_at = now() - interval '1 day' WHERE token_hash = $1`, [secondHash]);
    assert.equal((await request('/profile', 'GET', secondToken)).status, 401);

    const legacy = { ...profile, email: 'legacy@example.test', password: 'senha da política antiga' };
    await app.get(AuthService).register(createHash('sha256').update(other).digest('hex'), legacy);
    assert.equal((await request('/auth/login', 'POST', null, { email: legacy.email, password: legacy.password })).status, 200);

    let limited;
    for (let i = 0; i < 20; i++) {
      const attempt = await request('/auth/login', 'POST', null, { email: 'invalid', password: '' });
      if (attempt.status === 429) { limited = attempt; break; }
      assert.equal(attempt.status, 400);
    }
    assert.equal(limited?.status, 429);
    assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  } finally {
    await app?.close();
    if (provider.listening) {
      provider.closeAllConnections();
      await new Promise(resolve => provider.close(resolve));
    }
    if (previousMode === undefined) delete process.env.REQUIRE_ACCOUNT;
    else process.env.REQUIRE_ACCOUNT = previousMode;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    try {
      if (schemaCreated) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  }
});
