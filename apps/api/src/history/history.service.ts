import { performance } from 'node:perf_hooks';
import { ConflictException, HttpException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ApiMetrics } from '../observability/api-metrics.js';
import type { readSession } from './history-input.js';

@Injectable()
export class HistoryService implements OnModuleDestroy {
  private readonly logger = new Logger(HistoryService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000 })
    : undefined;

  constructor(private readonly metrics: ApiMetrics) {
    if (this.pool) {
      this.metrics.observeHistoryPool(this.pool);
      this.pool.on('error', () => this.logger.warn('Conexão do histórico interrompida.'));
    }
  }

  onModuleDestroy() {
    return this.pool?.end();
  }

  private async database<T>(operation: string, execute: (pool: Pool) => Promise<T>) {
    const startedAt = performance.now();
    let outcome = 'not_configured';
    try {
      if (!this.pool) throw new ServiceUnavailableException({ error: 'history_unavailable' });
      outcome = 'ok';
      return await execute(this.pool);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      outcome = 'database_error';
      this.logger.warn('Falha no acesso ao banco de histórico.');
      throw new ServiceUnavailableException({ error: 'history_unavailable' });
    } finally {
      this.metrics.recordHistory(operation, outcome, performance.now() - startedAt);
    }
  }

  list(owner: string) {
    return this.database('list', async (pool) => {
      const { rows } = await pool.query(
        `SELECT id, title, topic, updated_at AS "updatedAt"
         FROM chat_sessions WHERE owner_hash = $1 ORDER BY updated_at DESC, id LIMIT 50`,
        [owner],
      );
      return rows;
    });
  }

  detail(owner: string, id: string) {
    return this.database('detail', async (pool) => {
      const { rows: [session] } = await pool.query(
        `SELECT s.id, s.title, s.topic, s.updated_at AS "updatedAt", (
           SELECT json_agg(json_build_object('role', role, 'content', content, 'model', model) ORDER BY position)
           FROM chat_messages WHERE session_id = s.id
         ) AS messages
         FROM chat_sessions s WHERE s.owner_hash = $1 AND s.id = $2`,
        [owner, id],
      );
      if (!session) throw new NotFoundException();
      return session;
    });
  }

  save(owner: string, id: string, { topic, messages }: ReturnType<typeof readSession>) {
    return this.database('save', async (pool) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const session = await client.query(
          `INSERT INTO chat_sessions (id, owner_hash, topic, title, message_count)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET topic = EXCLUDED.topic, message_count = EXCLUDED.message_count,
             updated_at = now()
           WHERE chat_sessions.owner_hash = EXCLUDED.owner_hash
             AND chat_sessions.message_count <= EXCLUDED.message_count
           RETURNING id`,
          [id, owner, topic, messages[0].content.slice(0, 100), messages.length],
        );
        if (!session.rowCount) {
          const owned = await client.query('SELECT 1 FROM chat_sessions WHERE id = $1 AND owner_hash = $2', [id, owner]);
          if (!owned.rowCount) throw new NotFoundException();
          throw new ConflictException({ error: 'history_conflict' });
        }
        await client.query('DELETE FROM chat_messages WHERE session_id = $1', [id]);
        await client.query(
          `INSERT INTO chat_messages (session_id, position, role, content, model)
           SELECT $1, (ordinal - 1)::integer, item->>'role', item->>'content', item->>'model'
           FROM jsonb_array_elements($2::jsonb) WITH ORDINALITY AS records(item, ordinal)`,
          [id, JSON.stringify(messages)],
        );
        await client.query('COMMIT');
        return { id };
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    });
  }

  remove(owner: string, id: string) {
    return this.database('remove', async (pool) => {
      await pool.query('DELETE FROM chat_sessions WHERE owner_hash = $1 AND id = $2', [owner, id]);
    });
  }
}
