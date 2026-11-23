import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { createApiServer } from '../src/http.ts';

const server = createApiServer();
let baseUrl;

before(async () => {
  const listening = once(server, 'listening');
  server.listen(0, '127.0.0.1');
  await listening;
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server.listening) {
    const closed = once(server, 'close');
    server.close();
    await closed;
  }
});

test('GET /health informa que a API está disponível', async () => {
  const response = await fetch(`${baseUrl}/health?probe=1`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('HEAD /health retorna sucesso sem corpo', async () => {
  const response = await fetch(`${baseUrl}/health`, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('a API diferencia método inválido de rota inexistente', async () => {
  const unsupported = await fetch(`${baseUrl}/health`, { method: 'POST' });
  assert.equal(unsupported.status, 405);
  assert.equal(unsupported.headers.get('Allow'), 'GET, HEAD');

  const missing = await fetch(`${baseUrl}/nao-existe`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'not_found' });
});
