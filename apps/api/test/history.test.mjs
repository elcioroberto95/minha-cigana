import assert from 'node:assert/strict';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { copyFile, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from '../dist/app.module.js';
import { migrate } from '../scripts/migrate.mjs';

const databaseUrl = process.env.TEST_DATABASE_URL;

async function startApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  return app;
}

test('histórico rejeita acesso sem credencial de visitante', async () => {
  const app = await startApi();
  try {
    const response = await fetch((await app.getUrl()) + '/api/history');
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'visitor_required' });
  } finally {
    await app.close();
  }
});

test('histórico mantém dados após migração e reinício, isola e exclui sessões', {
  skip: !databaseUrl && 'Defina TEST_DATABASE_URL para testar com PostgreSQL.',
}, async () => {
  const admin = new Client({ connectionString: databaseUrl });
  const schema = 'history_test_' + randomBytes(12).toString('hex');
  const scopedUrl = new URL(databaseUrl);
  scopedUrl.searchParams.set('options', '-c search_path=' + schema);
  const previousUrl = process.env.DATABASE_URL;
  const visitor = randomBytes(32).toString('hex');
  const other = randomBytes(32).toString('hex');
  const oldId = randomUUID();
  const id = randomUUID();
  const directory = await mkdtemp(join(tmpdir(), 'cigana-migration-'));
  const initialMigration = join(directory, '001_chat_history.sql');
  let app;
  let schemaCreated = false;

  async function request(path, { token = visitor, method = 'GET', data } = {}) {
    return fetch((await app.getUrl()) + '/api/history' + path, {
      method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  try {
    await admin.connect();
    await admin.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    await copyFile(new URL('../migrations/001_chat_history.sql', import.meta.url), initialMigration);
    await migrate(scopedUrl.toString(), directory);

    const owner = createHash('sha256').update(visitor).digest('hex');
    await admin.query(`INSERT INTO ${schema}.chat_sessions (id, owner_hash, topic, title, message_count)
      VALUES ($1, $2, 'general', 'Consulta anterior', 2)`, [oldId, owner]);
    await admin.query(`INSERT INTO ${schema}.chat_messages (session_id, position, role, content)
      VALUES ($1, 0, 'user', 'Pergunta anterior'), ($1, 1, 'assistant', 'Resposta anterior')`, [oldId]);

    const migrations = [];
    await migrate(scopedUrl.toString(), undefined, (name) => migrations.push(name));
    await migrate(scopedUrl.toString(), undefined, (name) => migrations.push(name));
    assert.deepEqual(migrations, ['002_chat_message_model.sql']);

    process.env.DATABASE_URL = scopedUrl.toString();
    app = await startApi();
    const old = await request('/' + oldId);
    assert.equal(old.status, 200);
    assert.equal((await old.json()).messages[1].content, 'Resposta anterior');

    const data = { topic: 'work', messages: [
      { role: 'user', content: 'Quero mudar de trabalho.' },
      { role: 'assistant', content: 'Qual mudança faz sentido hoje?', model: 'test-model' },
    ] };
    for (let attempt = 0; attempt < 2; attempt++) {
      const saved = await request('/' + id, { method: 'PUT', data });
      assert.equal(saved.status, 200);
      assert.deepEqual(await saved.json(), { id });
    }

    await app.close();
    app = undefined;
    app = await startApi();
    const detail = await request('/' + id);
    assert.equal(detail.status, 200);
    assert.equal(detail.headers.get('Cache-Control'), 'no-store');
    const record = await detail.json();
    assert.equal(record.messages.length, 2);
    assert.deepEqual(record.messages[1], data.messages[1]);

    assert.equal((await request('/' + id, { token: other })).status, 404);
    assert.equal((await request('/' + id, { token: other, method: 'PUT', data })).status, 404);
    assert.deepEqual(await (await request('', { token: other })).json(), []);
    assert.equal((await request('/' + id, { token: other, method: 'DELETE' })).status, 204);
    assert.equal((await request('/' + id)).status, 200);
    assert.equal((await request('/' + id, { method: 'DELETE' })).status, 204);
    assert.equal((await request('/' + id)).status, 404);
    assert.equal((await admin.query(`SELECT count(*)::int AS count FROM ${schema}.chat_messages WHERE session_id = $1`, [id])).rows[0].count, 0);
  } finally {
    await app?.close();
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    try {
      if (schemaCreated) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    } finally {
      await admin.end();
      await unlink(initialMigration).catch(() => {});
      await rmdir(directory).catch(() => {});
    }
  }
});
