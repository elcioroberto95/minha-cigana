import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';
import { createBetaAccess } from '../dist/beta-access.js';

test('ESM-10 requires an active invite and limits generation separately per invite', async () => {
  const invite = 'a'.repeat(32);
  const other = 'b'.repeat(32);
  const hashes = [invite, other].map((value) => createHash('sha256').update(value).digest('hex'));
  const app = express();
  app.use('/api', createBetaAccess(hashes.join(',')));
  app.post('/api/chat', (_request, response) => response.sendStatus(200));
  app.get('/health', (_request, response) => response.sendStatus(200));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;
  const call = (path, code, method = 'GET') => fetch(url + path, {
    method,
    headers: code ? { 'X-Beta-Invite': code } : {},
  });
  try {
    assert.equal((await call('/health')).status, 200);
    assert.equal((await call('/api/beta/access')).status, 403);
    assert.equal((await call('/api/beta/access', 'c'.repeat(32))).status, 403);
    assert.equal((await call('/api/beta/access', invite)).status, 204);
    for (let index = 0; index < 6; index++) {
      assert.equal((await call('/api/chat', invite, 'POST')).status, 200);
    }
    const limit = await call('/api/chat/', invite, 'POST');
    assert.equal(limit.status, 429);
    assert.ok(Number(limit.headers.get('retry-after')) > 0);
    assert.equal((await call('/api/chat', other, 'POST')).status, 200);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
