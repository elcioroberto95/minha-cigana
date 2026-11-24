import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const defaultDirectory = fileURLToPath(new URL('../migrations/', import.meta.url));

export async function migrate(connectionString, directory = defaultDirectory, onApplied = () => {}) {
  const files = (await readdir(directory)).filter((name) => /^\d{3}_[\w-]+\.sql$/.test(name)).sort();
  if (!files.length) throw new Error('No SQL migrations found.');
  const client = new Client({ connectionString, connectionTimeoutMillis: 5_000 });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(291833760)');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
    const applied = await client.query('SELECT name, checksum FROM schema_migrations');
    const checksums = new Map(applied.rows.map(({ name, checksum }) => [name, checksum]));
    const changes = [];
    for (const name of files) {
      const sql = (await readFile(resolve(directory, name), 'utf8')).replaceAll('\r\n', '\n');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = checksums.get(name);
      if (existing === checksum) continue;
      if (existing) throw new Error('Checksum changed for migration ' + name);
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [name, checksum]);
      changes.push(name);
    }
    await client.query('COMMIT');
    changes.forEach(onApplied);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  if (existsSync('.env')) process.loadEnvFile('.env');
  try {
    if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL before migrating.');
    await migrate(process.env.DATABASE_URL, undefined, (name) => console.log('Applied ' + name));
    console.log('Database migrations are up to date.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
