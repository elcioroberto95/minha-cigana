import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../dist/app.module.js';
import { deck, readingPrompt, shuffleSelection, spreads } from '../dist/tarot/deck.js';
import { migrate } from '../scripts/migrate.mjs';

test('ESM-08 verifica o catálogo completo e a recuperação por orientação', () => {
  assert.equal(deck.length, 78);
  assert.equal(new Set(deck.map(({ id }) => id)).size, 78);
  assert.deepEqual(deck.filter(({ arcano }) => arcano === 'maior').map(({ numero }) => numero),
    Array.from({ length: 22 }, (_, index) => index));
  for (const suit of ['paus', 'copas', 'espadas', 'ouros']) {
    assert.deepEqual(deck.filter(({ naipe }) => naipe === suit).map(({ numero }) => numero),
      Array.from({ length: 14 }, (_, index) => index + 1));
  }
  for (const card of deck) {
    for (const field of ['nome', 'nome_en', 'significado_normal', 'significado_invertido', 'amor', 'trabalho', 'conselho']) {
      assert.ok(card[field]?.trim(), card.id + ' ' + field);
    }
    assert.ok(card.palavras_chave.length >= 2);
    assert.notEqual(card.significado_normal, card.significado_invertido);
  }
  for (const [format, { positions }] of Object.entries(spreads)) {
    const selection = shuffleSelection(format, positions.map((_, index) => index));
    assert.equal(selection.length, positions.length);
    assert.equal(new Set(selection.map(({ id }) => id)).size, positions.length);
    assert.ok(selection.every(({ orientation }) => ['normal', 'invertida'].includes(orientation)));
  }
  const selected = [{ id: 'maior-0', orientation: 'invertida' }];
  const prompt = readingPrompt('sim-ou-nao', selected, 'pt-BR', 'Devo começar?');
  const payload = JSON.parse(prompt.split('\n')[1]);
  assert.equal(payload.pergunta, 'Devo começar?');
  assert.equal(payload.tiragem, 'Sim ou Não');
  assert.deepEqual(payload.cartas, [{
    carta: 'O Louco', posição: 'Resposta simbólica', orientação: 'invertida', significado: deck[0].significado_invertido,
  }]);
  assert.ok(!prompt.includes(deck[0].significado_normal) && !prompt.includes(deck[1].significado_normal));
});

const databaseUrl = process.env.TEST_DATABASE_URL;

test('ESM-08 registra, protege e interpreta a mesma tiragem após falha', {
  skip: !databaseUrl && 'Defina TEST_DATABASE_URL para testar com PostgreSQL.',
}, async () => {
  const schema = 'tarot_test_' + randomBytes(9).toString('hex');
  const admin = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
  const scoped = new URL(databaseUrl);
  scoped.searchParams.set('options', '-c search_path=' + schema);
  const visitor = randomBytes(32).toString('hex');
  const other = randomBytes(32).toString('hex');
  const id = randomUUID();
  const calls = [];
  let app;
  let fail = true;
  let createdSchema = false;
  const provider = createServer(async (request, response) => {
    let data = '';
    for await (const chunk of request) data += chunk;
    calls.push(JSON.parse(data));
    response.writeHead(fail ? 500 : 200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ model: 'esmeralda', message: { content: 'Meu bem, vejo um caminho que pede calma.' } }));
  });

  async function start() {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  }

  async function request(path, method, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch((await app.getUrl()) + '/api/tarot/' + path, { method, headers, body: JSON.stringify(body) });
  }

  try {
    await admin.connect();
    await admin.query(`CREATE SCHEMA ${schema}`);
    createdSchema = true;
    await migrate(scoped.toString());
    provider.listen(0, '127.0.0.1');
    await once(provider, 'listening');
    process.env.DATABASE_URL = scoped.toString();
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:' + provider.address().port;
    process.env.OLLAMA_MODEL = 'esmeralda';
    await start();

    const input = { id, format: 'tres-cartas', locale: 'pt-BR', topic: 'work', question: 'Como retomar?', slots: [3, 0, 6] };
    assert.equal((await request('draw', 'POST', undefined, input)).status, 401);
    assert.equal((await request('draw', 'POST', visitor, { ...input, slots: [0, 0, 1] })).status, 400);
    const response = await request('draw', 'POST', visitor, input);
    assert.equal(response.status, 200);
    const draw = await response.json();
    assert.equal(draw.reading, null);
    assert.deepEqual(draw.cards.map(({ position }) => position), ['Passado', 'Presente', 'Futuro simbólico']);
    assert.deepEqual(await (await request('draw', 'POST', visitor, input)).json(), draw);
    assert.equal((await request('draw/' + id, 'GET', other)).status, 404);
    assert.equal((await request('interpret/' + id, 'POST', other)).status, 404);
    assert.equal(calls.length, 0);
    assert.equal((await request('interpret/' + id, 'POST', visitor)).status, 503);
    assert.deepEqual(await (await request('draw/' + id, 'GET', visitor)).json(), draw);

    fail = false;
    const outcomes = await Promise.all(Array.from({ length: 4 }, async () => {
      const interpreted = await request('interpret/' + id, 'POST', visitor);
      assert.equal(interpreted.status, 200);
      return interpreted.json();
    }));
    assert.ok(outcomes.every((result) => result.reading === outcomes[0].reading));
    assert.deepEqual(outcomes[0].cards, draw.cards);
    assert.equal(calls.length, 2);
    const messages = calls[1].messages;
    assert.equal(messages.length, 4);
    const content = messages.at(-1).content;
    assert.match(content, /Como retomar\?/);
    const actualCards = JSON.parse(content.split('\n')[1]).cartas;
    for (const [index, selected] of draw.cards.entries()) {
      const editorial = deck.find(({ id }) => id === selected.card.id);
      assert.deepEqual(actualCards[index], {
        carta: selected.card.name, posição: selected.position, orientação: selected.orientation,
        significado: selected.orientation === 'invertida' ? editorial.significado_invertido : editorial.significado_normal,
      });
    }

    await app.close();
    app = undefined;
    await start();
    assert.deepEqual(await (await request('draw/' + id, 'GET', visitor)).json(), outcomes[0]);
    assert.deepEqual(await (await request('interpret/' + id, 'POST', visitor)).json(), outcomes[0]);
    assert.equal(calls.length, 2);
  } finally {
    await app?.close();
    if (provider.listening) {
      provider.closeAllConnections();
      await new Promise((resolve) => provider.close(resolve));
    }
    try {
      if (createdSchema) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  }
});
