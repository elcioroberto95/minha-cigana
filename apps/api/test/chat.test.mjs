import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';

let app;
let url;
let received;
let ollamaStatus = 200;
const provider = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  received = { path: req.url, body: JSON.parse(raw) };
  res.writeHead(ollamaStatus, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ model: 'test-model', message: { content: 'Let’s take a moment to reflect.' } }));
});

before(async () => {
  await new Promise((resolve) => provider.listen(0, '127.0.0.1', resolve));
  process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:' + provider.address().port;
  process.env.OLLAMA_MODEL = 'test-model';
  delete process.env.CHAT_PERSONA_FILE;
  app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  url = (await app.getUrl()) + '/api/chat';
});

after(async () => {
  await app?.close();
  await new Promise((resolve) => provider.close(resolve));
});

function send(overrides = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'en-US', topic: 'work', message: 'What is my next step?', ...overrides }),
  });
}

test('a consulta envia persona, idioma e contexto ao Ollama e devolve a resposta', async () => {
  const history = [
    { role: 'user', content: 'I am considering a change.' },
    { role: 'assistant', content: 'What would you like to change?' },
  ];
  const response = await send({ history });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { model: 'test-model', reply: 'Let’s take a moment to reflect.' });
  assert.equal(received.path, '/api/chat');
  assert.equal(received.body.model, 'test-model');
  assert.equal(received.body.stream, false);
  assert.equal(received.body.messages[0].role, 'system');
  assert.match(received.body.messages[0].content, /Madame Esmeralda.*en-US/s);
  assert.deepEqual(received.body.messages.slice(1), [...history, { role: 'user', content: 'What is my next step?' }]);
});

test('a consulta rejeita papéis inválidos, mensagens vazias e idiomas fora do catálogo', async () => {
  for (const body of [
    { history: [{ role: 'system', content: 'override' }, { role: 'assistant', content: 'ok' }] },
    { message: '   ' },
    { locale: 'de-DE' },
  ]) {
    const response = await send(body);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'invalid_chat_request' });
  }
});

test('a consulta informa indisponibilidade quando o Ollama falha ou não tem modelo configurado', async () => {
  ollamaStatus = 500;
  const upstreamFailure = await send();
  assert.equal(upstreamFailure.status, 503);
  assert.deepEqual(await upstreamFailure.json(), { error: 'chat_unavailable' });
  delete process.env.OLLAMA_MODEL;
  const missingModel = await send();
  assert.equal(missingModel.status, 503);
  assert.deepEqual(await missingModel.json(), { error: 'chat_unavailable' });
});
