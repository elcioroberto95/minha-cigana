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
  const attempt = randomUUID();
  const calls = [];
  let app;
  let providerOutcome = 'unavailable';
  let createdSchema = false;
  const provider = createServer(async (request, response) => {
    let data = '';
    for await (const chunk of request) data += chunk;
    const call = JSON.parse(data);
    calls.push(call);
    let content = 'Meu bem, vejo um caminho que pede calma.';
    if (call.format && providerOutcome !== 'plain') {
      const { cartas } = JSON.parse(call.messages.at(-1).content.split('\n')[1]);
      const cards = cartas.map(({ cardId }, index) => ({ cardId, interpretation: 'Reflexão ' + (index + 1) + '.' }));
      if (providerOutcome === 'duplicate') cards[1].cardId = cards[0].cardId;
      if (providerOutcome === 'reordered') cards.reverse();
      if (providerOutcome === 'invented') cards[0].cardId = 'outra-carta';
      if (providerOutcome === 'missing') cards.pop();
      content = JSON.stringify({ cards, summary: 'Conecte experiência e possibilidade.', advice: 'Comece com um passo simples.' });
    }
    response.writeHead(providerOutcome === 'unavailable' ? 500 : 200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ model: 'esmeralda', message: { content } }));
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
    process.env.PILOT_COMPUTE_COST_PER_HOUR_BRL = '12';
    await start();

    const input = { id, format: 'tres-cartas', locale: 'pt-BR', topic: 'work', question: 'Como retomar?', slots: [3, 0, 6] };
    for (let retry = 0; retry < 2; retry++) assert.equal((await request('pilot/' + attempt + '/start', 'POST', visitor)).status, 204);
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

    for (const invalid of ['plain', 'duplicate', 'reordered', 'invented', 'missing']) {
      providerOutcome = invalid;
      const rejected = await request('interpret/' + id, 'POST', visitor);
      assert.equal(rejected.status, 503);
      assert.deepEqual(await rejected.json(), { error: 'tarot_unavailable' });
      assert.deepEqual(await (await request('draw/' + id, 'GET', visitor)).json(), draw);
    }

    providerOutcome = 'valid';
    const previousCalls = calls.length;
    const outcomes = await Promise.all(Array.from({ length: 4 }, async () => {
      const interpreted = await request('interpret/' + id, 'POST', visitor);
      assert.equal(interpreted.status, 200);
      return interpreted.json();
    }));
    for (const result of outcomes) assert.deepEqual(result, outcomes[0]);
    assert.deepEqual(outcomes[0].cards, draw.cards);
    assert.deepEqual(outcomes[0].structuredReading, {
      cards: draw.cards.map(({ card }, index) => ({ cardId: card.id, interpretation: 'Reflexão ' + (index + 1) + '.' })),
      summary: 'Conecte experiência e possibilidade.',
      advice: 'Comece com um passo simples.',
    });
    for (const { card } of draw.cards) assert.ok(outcomes[0].reading.includes(card.name));
    assert.equal(calls.length, previousCalls + 1);
    const structuredCall = calls.at(-1);
    assert.deepEqual(structuredCall.format.properties.cards.items.properties.cardId.enum, draw.cards.map(({ card }) => card.id));
    assert.equal(structuredCall.format.properties.cards.minItems, 3);
    assert.equal(structuredCall.format.properties.cards.maxItems, 3);
    assert.equal(structuredCall.tools, undefined);
    const { messages } = structuredCall;
    assert.equal(messages.length, 4);
    const content = messages.at(-1).content;
    assert.match(content, /Como retomar\?/);
    const actualCards = JSON.parse(content.split('\n')[1]).cartas;
    for (const [index, selected] of draw.cards.entries()) {
      const editorial = deck.find(({ id }) => id === selected.card.id);
      assert.deepEqual(actualCards[index], {
        cardId: selected.card.id, carta: selected.card.name, posição: selected.position, orientação: selected.orientation,
        significado: selected.orientation === 'invertida' ? editorial.significado_invertido : editorial.significado_normal,
      });
    }

    await app.close();
    app = undefined;
    await start();
    assert.deepEqual(await (await request('draw/' + id, 'GET', visitor)).json(), outcomes[0]);
    assert.deepEqual(await (await request('interpret/' + id, 'POST', visitor)).json(), outcomes[0]);
    assert.equal(calls.length, previousCalls + 1);

    const legacyId = randomUUID();
    assert.equal((await request('draw', 'POST', visitor, { ...input, id: legacyId })).status, 200);
    await admin.query(`UPDATE ${schema}.tarot_draws SET reading = $2, model = 'legacy' WHERE id = $1`, [legacyId, 'Leitura anterior.']);
    const legacy = await (await request('interpret/' + legacyId, 'POST', visitor)).json();
    assert.equal(legacy.reading, 'Leitura anterior.');
    assert.equal(legacy.structuredReading, undefined);
    assert.equal(calls.length, previousCalls + 1);

    const yesNoId = randomUUID();
    assert.equal((await request('draw', 'POST', visitor, { ...input, id: yesNoId, format: 'sim-ou-nao', slots: [0] })).status, 200);
    const yesNo = await (await request('interpret/' + yesNoId, 'POST', visitor)).json();
    assert.equal(yesNo.reading, 'Meu bem, vejo um caminho que pede calma.');
    assert.equal(yesNo.structuredReading, undefined);
    assert.equal(calls.at(-1).format, undefined);

    const related = { drawId: id, locale: 'pt-BR', topic: 'love', message: 'Quero falar sobre essa leitura.' };
    const chatUrl = (await app.getUrl()) + '/api/chat';
    const chat = (token) => fetch(chatUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(related),
    });
    const callsBeforeChat = calls.length;
    assert.equal((await chat(other)).status, 404);
    assert.equal(calls.length, callsBeforeChat);
    assert.equal((await chat(visitor)).status, 200);
    const promptContext = calls.at(-1).messages[0].content;
    assert.match(promptContext, /Tema sugerido: work/);
    assert.ok(promptContext.includes('Como retomar?'));
    for (const { card, position, orientation } of draw.cards) {
      assert.ok(promptContext.includes(JSON.stringify({ name: card.name, position, orientation })));
    }
    for (const token of [other, visitor, visitor]) assert.equal((await request('draw/' + id + '/audio-started', 'POST', token)).status, 204);
    const { rows: attempts } = await admin.query(`SELECT id FROM ${schema}.tarot_pilot_attempts`);
    assert.deepEqual(attempts, [{ id: attempt }]);
    const { rows: events } = await admin.query(`SELECT event FROM ${schema}.tarot_pilot_events WHERE draw_id = $1 ORDER BY event`, [id]);
    assert.deepEqual(events, [{ event: 'audio_started' }, { event: 'chat_continued' }]);
    const { rows: [cost] } = await admin.query(`SELECT generation_ms, estimated_compute_cost_brl FROM ${schema}.tarot_draws WHERE id = $1`, [id]);
    assert.notEqual(cost.estimated_compute_cost_brl, null);
    assert.ok(cost.generation_ms >= 0 && Number(cost.estimated_compute_cost_brl) >= 0);
  } finally {
    delete process.env.PILOT_COMPUTE_COST_PER_HOUR_BRL;
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
