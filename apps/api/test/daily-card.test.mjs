import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../dist/app.module.js';
import { dailyDate } from '../dist/daily-card/daily-date.js';
import { migrate } from '../scripts/migrate.mjs';

const databaseUrl = process.env.TEST_DATABASE_URL;
const beforeMidnight = new Date('2026-11-24T02:59:59Z');
const afterMidnight = new Date('2026-11-24T03:00:00Z');

test('a data da Carta do Dia vira à meia-noite em São Paulo', () => {
  assert.equal(dailyDate(beforeMidnight), '2026-11-23');
  assert.equal(dailyDate(afterMidnight), '2026-11-24');
});

test('a Carta do Dia é única, sobrevive a reinício e vira contexto privado do chat', {
  skip: !databaseUrl && 'Defina TEST_DATABASE_URL para testar com PostgreSQL.',
}, async (t) => {
  const admin = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
  const schema = 'daily_test_' + randomBytes(12).toString('hex');
  const scopedUrl = new URL(databaseUrl);
  scopedUrl.searchParams.set('options', '-c search_path=' + schema);
  const visitor = randomBytes(32).toString('hex');
  const other = randomBytes(32).toString('hex');
  let sentToModel;
  const modelRequests = [];
  const scriptedReplies = [];
  const plainReply = { content: 'Pense num gesto simples para hoje.' };
  const toolCall = { function: { name: 'get_daily_card', arguments: {} } };
  const toolReply = { content: '', tool_calls: [toolCall] };
  const provider = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    sentToModel = JSON.parse(body);
    modelRequests.push(sentToModel);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ model: 'test', message: scriptedReplies.shift() ?? plainReply }));
  });
  let app;
  let schemaCreated = false;

  async function startApi() {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  }

  async function request(path, method, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch((await app.getUrl()) + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
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
    t.mock.timers.enable({ apis: ['Date'], now: beforeMidnight });
    await startApi();
    const path = '/api/tarot/daily';
    assert.equal((await request(path, 'POST')).status, 401);
    const empty = await request(path, 'GET', visitor);
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { draw: null });

    const requests = await Promise.all(Array.from({ length: 8 }, () => request(path, 'POST', visitor)));
    assert.ok(requests.every((response) => response.status === 200));
    const results = await Promise.all(requests.map((response) => response.json()));
    const first = results[0];
    for (const result of results) assert.deepEqual(result, first);
    assert.equal(first.draw.date, '2026-11-23');
    assert.ok(first.draw.card.readings['pt-BR'].reflection);
    assert.ok(first.draw.card.readings['en-US'].reflection);
    const rows = await admin.query(`SELECT count(*)::int AS count FROM ${schema}.daily_draws`);
    assert.equal(rows.rows[0].count, 1);
    assert.deepEqual(await (await request(path, 'GET', other)).json(), { draw: null });

    await app.close();
    app = undefined;
    await startApi();
    assert.deepEqual(await (await request(path, 'GET', visitor)).json(), first);

    const message = { locale: 'en-US', topic: 'general', message: 'What can I reflect on?', dailyCardId: first.draw.id };
    assert.equal((await request('/api/chat', 'POST', other, message)).status, 404);
    assert.equal(sentToModel, undefined);
    const chat = await request('/api/chat', 'POST', visitor, message);
    assert.equal(chat.status, 200);
    assert.ok(sentToModel.messages[0].content.includes(first.draw.card.readings['en-US'].title));
    assert.ok(sentToModel.messages[0].content.includes(first.draw.card.readings['en-US'].reflection));
    assert.equal(sentToModel.tools, undefined);

    const question = { locale: 'en-US', topic: 'general', message: 'What is my Card of the Day?' };
    async function ask(token, replies, status = 200) {
      modelRequests.length = 0;
      scriptedReplies.push(...replies);
      const response = await request('/api/chat', 'POST', token, question);
      assert.equal(response.status, status);
      assert.equal(scriptedReplies.length, 0);
      assert.equal(modelRequests.length, replies.length);
      return response.json();
    }

    const finalAnswer = { content: 'My dear, your card offers a moment for reflection.' };
    assert.deepEqual(await ask(visitor, [toolReply, { content: 'I am an AI.' }, finalAnswer]),
      { reply: finalAnswer.content, model: 'test' });
    const [initial, followUp, retry] = modelRequests;
    assert.equal(initial.tools.length, 1);
    assert.equal(initial.tools[0].function.name, toolCall.function.name);
    assert.equal(initial.tools[0].function.parameters.additionalProperties, false);
    assert.equal(followUp.tools, undefined);
    assert.deepEqual(followUp.messages.at(-2), { role: 'assistant', content: '', tool_calls: [toolCall] });
    const { title, reflection } = first.draw.card.readings['en-US'];
    assert.deepEqual(followUp.messages.at(-1), {
      role: 'tool',
      tool_name: 'get_daily_card',
      content: JSON.stringify({ status: 'revealed', title, reflection }),
    });
    assert.deepEqual(retry.messages.slice(1), followUp.messages.slice(1));
    assert.equal(retry.tools, undefined);

    await ask(other, [toolReply, finalAnswer]);
    assert.deepEqual(JSON.parse(sentToModel.messages.at(-1).content), { status: 'not_revealed' });
    assert.deepEqual(await (await request(path, 'GET', other)).json(), { draw: null });

    await ask(undefined, [toolReply], 503);
    assert.equal(sentToModel.tools, undefined);
    for (const calls of [
      [{ function: { name: 'other_tool', arguments: {} } }],
      [{ function: { ...toolCall.function, arguments: { owner: other } } }],
      [toolCall, toolCall],
    ]) {
      await ask(visitor, [{ content: '', tool_calls: calls }], 503);
    }
    await ask(visitor, [toolReply, toolReply], 503);

    t.mock.timers.setTime(afterMidnight.getTime());
    assert.deepEqual(await (await request(path, 'GET', visitor)).json(), { draw: null });
    await ask(visitor, [toolReply, finalAnswer]);
    assert.deepEqual(JSON.parse(sentToModel.messages.at(-1).content), { status: 'not_revealed' });
    const next = await (await request(path, 'POST', visitor)).json();
    assert.equal(next.draw.date, '2026-11-24');
    assert.notEqual(next.draw.id, first.draw.id);
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
