import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createThreeCardGraph } from '../dist/tarot/three-card-graph.js';

const cards = [
  { id: 'maior-9', orientation: 'normal' },
  { id: 'maior-14', orientation: 'normal' },
  { id: 'maior-18', orientation: 'invertida' },
];
const prompt = { locale: 'pt-BR', topic: 'work', message: 'Pergunta de teste' };
const reading = {
  cards: cards.map(({ id }) => ({ cardId: id, interpretation: 'Leitura simbólica.' })),
  summary: 'Síntese.', advice: 'Conselho.',
};

test('ESM-19 prova a saída válida e a correção de ordem com exatamente uma tentativa adicional', async () => {
  for (const needsRepair of [false, true]) {
    const calls = [];
    const interpret = createThreeCardGraph(async (input, schema, signal) => {
      calls.push({ input, schema, signal });
      const output = needsRepair && calls.length === 1 ? { ...reading, cards: [...reading.cards].reverse() } : reading;
      return { reply: JSON.stringify(output), model: 'fixture' };
    });
    const result = await interpret(prompt, cards);
    assert.deepEqual(result.structuredReading, reading);
    assert.equal(result.attempts, needsRepair ? 2 : 1);
    assert.equal(calls.length, result.attempts);
    assert.equal(calls[0].input.message, prompt.message);
    assert.ok(calls.every(({ signal }) => signal instanceof AbortSignal && !signal.aborted));
    if (needsRepair) {
      assert.match(calls[1].input.message, /resposta anterior foi rejeitada/);
      assert.deepEqual(calls[0].schema, calls[1].schema);
    }
  }
});

test('ESM-19 termina após duas saídas inválidas e propaga falha do modelo na primeira chamada', async () => {
  let invalidCalls = 0;
  const invalid = createThreeCardGraph(async () => {
    invalidCalls++;
    return { reply: 'texto fora do schema', model: 'fixture' };
  });
  assert.equal(await invalid(prompt, cards), undefined);
  assert.equal(invalidCalls, 2);
  let failedCalls = 0;
  const unavailable = createThreeCardGraph(async () => { failedCalls++; throw new Error('upstream offline'); });
  await assert.rejects(unavailable(prompt, cards), /upstream offline/);
  assert.equal(failedCalls, 1);
});
