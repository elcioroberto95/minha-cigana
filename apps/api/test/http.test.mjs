import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';

let app;
let baseUrl;

before(async () => {
  app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  baseUrl = await app.getUrl();
});

after(() => app?.close());

test('GET /health informa que a API está disponível', async () => {
  const response = await fetch(`${baseUrl}/health?probe=1`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
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
  assert.deepEqual(await unsupported.json(), { error: 'method_not_allowed' });

  const missing = await fetch(`${baseUrl}/nao-existe`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'not_found' });
});
