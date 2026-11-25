import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AccountUsage } from '../dist/auth/account-usage.js';
import { readMemoryCall } from '../dist/chat/memory-tool.js';
import { memoryCandidate } from '../dist/profile/domain/learned-fact.js';

test('ESM-14 limita gerações por conta e distingue leituras simples', () => {
  const limiter = new AccountUsage();
  const headers = new Map();
  const response = { setHeader: (key, value) => headers.set(key, value) };
  for (let i = 0; i < 6; i++) limiter.check('a', { method: 'POST', path: '/api/chat' }, response);
  assert.throws(() => limiter.check('a', { method: 'POST', path: '/api/tarot/interpret/42' }, response), { status: 429 });
  assert.ok(headers.get('Retry-After') > 0);
  limiter.check('a', { method: 'GET', path: '/api/profile' }, response);
  limiter.check('b', { method: 'POST', path: '/api/chat' }, response);
});

test('ESM-15 extrai uma declaração elegível e limita a chamada a essa categoria', () => {
  assert.deepEqual(memoryCandidate('Trabalho como dev. O que devo fazer?'), { kind: 'occupation', value: 'dev' });
  assert.deepEqual(memoryCandidate('Sou casada.'), { kind: 'relationship', value: 'married' });
  assert.deepEqual(memoryCandidate('I want to start a business.'), { kind: 'career_goal', value: 'start_business' });
  for (const sentence of ['Será que sou casado?', 'Trabalho como médica?', 'Meu amigo é casado.', 'Suspeito de João.',
    'Tenho um problema de saúde.', 'Estou traindo.', 'Trabalho como instrutor e tenho um processo judicial.']) {
    assert.equal(memoryCandidate(sentence), undefined);
  }
  const call = [{ function: { name: 'remember_profile_fact', arguments: { kind: 'occupation' } } }];
  assert.deepEqual(readMemoryCall(call, 'occupation'), call[0]);
  assert.equal(readMemoryCall(call, 'relationship'), undefined);
  assert.equal(readMemoryCall([{ function: { ...call[0].function, arguments: { kind: 'occupation', owner: 'b' } } }], 'occupation'), undefined);
});
