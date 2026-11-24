import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { setTimeout as wait } from 'node:timers/promises';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';

let app;
let url;
let received;
let ollamaStatus = 200;
let pauseResponse;
const logs = [];
const provider = createServer(async (req, res) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  received = { path: req.url, body: JSON.parse(raw) };
  if (pauseResponse) await pauseResponse;
  res.writeHead(ollamaStatus, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    model: 'test-model',
    message: { content: 'Let’s take a moment to reflect.' },
    total_duration: 12_000_000,
    load_duration: 1_000_000,
    prompt_eval_duration: 2_000_000,
    eval_duration: 8_000_000,
  }));
});

before(async () => {
  await new Promise((resolve) => provider.listen(0, '127.0.0.1', resolve));
  process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:' + provider.address().port;
  process.env.OLLAMA_MODEL = 'test-model';
  delete process.env.CHAT_PERSONA_FILE;
  app = await NestFactory.create(AppModule, {
    logger: {
      log: (message) => logs.push(message),
      warn: (message) => logs.push(message),
      error: () => {},
    },
  });
  await app.listen(0, '127.0.0.1');
  url = (await app.getUrl()) + '/api/chat';
});

after(async () => {
  await app?.close();
  await new Promise((resolve) => provider.close(resolve));
});

function send(overrides = {}, signal) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({ locale: 'en-US', topic: 'work', message: 'What is my next step?', ...overrides }),
  });
}

function requestLogs(response) {
  const id = response.headers.get('X-Request-ID');
  assert.match(id, /^[\da-f]{8}-[\da-f-]{27}$/);
  return logs.filter((entry) => entry.request_id === id);
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
  const [ollama, request] = requestLogs(response);
  assert.equal(ollama.event, 'ollama.chat.completed');
  assert.equal(ollama.outcome, 'ok');
  assert.equal(ollama.ollama_total_ms, 12);
  assert.equal(ollama.model_load_ms, 1);
  assert.equal(ollama.prompt_eval_ms, 2);
  assert.equal(ollama.generation_ms, 8);
  assert.equal(request.event, 'http.request.completed');
  assert.equal(request.route, '/api/chat');
  assert.equal(request.status, 200);
  assert.ok(request.duration_ms >= ollama.duration_ms && ollama.duration_ms >= 0);
  assert.doesNotMatch(JSON.stringify([ollama, request]), /next step|take a moment|Madame Esmeralda|considering a change/i);
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
    const events = requestLogs(response);
    assert.deepEqual(events.map(({ event, status }) => ({ event, status })), [
      { event: 'http.request.completed', status: 400 },
    ]);
  }
});

test('a observabilidade é global, usa o template da rota e ignora valores dos parâmetros', async () => {
  const response = await fetch(new URL('/api/history/private-id?token=private-value', url));
  assert.equal(response.status, 401);
  const [request] = requestLogs(response);
  assert.equal(request.event, 'http.request.completed');
  assert.equal(request.route, '/api/history/:id');
  assert.equal(request.method, 'GET');
  assert.equal(request.status, 401);
  assert.doesNotMatch(JSON.stringify(request), /private-id|private-value/);
});

test('consultas concorrentes mantêm um identificador por requisição', async () => {
  const responses = await Promise.all([send({ message: 'Primeira' }), send({ message: 'Segunda' })]);
  const ids = new Set();
  for (const response of responses) {
    assert.equal(response.status, 200);
    const [inference, request] = requestLogs(response);
    assert.equal(inference.event, 'ollama.chat.completed');
    assert.equal(request.event, 'http.request.completed');
    ids.add(request.request_id);
  }
  assert.equal(ids.size, 2);
});

test('a observabilidade registra uma vez a conexão encerrada pelo cliente', async () => {
  let release;
  pauseResponse = new Promise((resolve) => { release = resolve; });
  const arrivals = new Promise((resolve) => provider.once('request', resolve));
  const controller = new AbortController();
  const start = logs.length;
  const request = send({}, controller.signal);
  try {
    await arrivals;
    controller.abort();
    await assert.rejects(request, { name: 'AbortError' });
    const aborted = () => logs.slice(start).filter((entry) => entry.event === 'http.request.completed'
      && entry.route === '/api/chat' && entry.aborted);
    for (let retries = 0; retries < 100 && !aborted().length; retries++) await wait(50);
    assert.equal(aborted().length, 1);
    assert.equal(aborted()[0].status, 499);
  } finally {
    pauseResponse = undefined;
    release();
  }
});

test('a consulta informa indisponibilidade quando o Ollama falha ou não tem modelo configurado', async () => {
  ollamaStatus = 500;
  const upstreamFailure = await send();
  assert.equal(upstreamFailure.status, 503);
  assert.deepEqual(await upstreamFailure.json(), { error: 'chat_unavailable' });
  const [failure, request] = requestLogs(upstreamFailure);
  assert.equal(failure.outcome, 'upstream_http_error');
  assert.equal(failure.upstream_status, 500);
  assert.equal(request.status, 503);
  delete process.env.OLLAMA_MODEL;
  const missingModel = await send();
  assert.equal(missingModel.status, 503);
  assert.deepEqual(await missingModel.json(), { error: 'chat_unavailable' });
  assert.equal(requestLogs(missingModel)[0].outcome, 'not_configured');
});
