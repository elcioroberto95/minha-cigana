import { ConflictException, HttpException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { dailyDate } from '../daily-card/daily-date.js';
import type { PersonalContext } from './application/consultation-memory.js';
import { relevantLearnedKinds, type LearnedFact } from './domain/learned-fact.js';
import type { readCheckIn, readProfile } from './profile-input.js';

type Profile = ReturnType<typeof readProfile>;

@Injectable()
export class ProfileService implements OnModuleDestroy {
  private readonly logger = new Logger(ProfileService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000, max: 4 })
    : undefined;

  constructor() {
    this.pool?.on('error', () => this.logger.warn('Conexão do perfil interrompida.'));
  }

  onModuleDestroy() {
    return this.pool?.end();
  }

  profile(owner: string) {
    return this.database(async (pool) => {
      const { rows: [profile] } = await pool.query<Profile>(
        'SELECT name, email, sex FROM visitor_profiles WHERE owner_hash = $1', [owner],
      );
      return { profile: profile ?? null };
    });
  }

  saveProfile(owner: string, { name, email, sex }: Profile) {
    return this.database(async (pool) => {
      const { rows: [profile] } = await pool.query<Profile>(
        `INSERT INTO visitor_profiles (owner_hash, name, email, sex) VALUES ($1, $2, $3, $4)
         ON CONFLICT (owner_hash) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, sex = EXCLUDED.sex
         RETURNING name, email, sex`,
        [owner, name, email, sex],
      );
      return { profile };
    });
  }

  memory(owner: string) {
    return this.database(async (pool) => {
      const { rows: [memory] } = await pool.query<{ enabled: boolean }>(
        'SELECT enabled FROM visitor_memory WHERE owner_hash = $1', [owner],
      );
      return { enabled: memory?.enabled ?? false };
    });
  }

  setMemory(owner: string, enabled: boolean) {
    return this.database(async (pool) => {
      await pool.query(
        `INSERT INTO visitor_memory (owner_hash, enabled) VALUES ($1, $2)
         ON CONFLICT (owner_hash) DO UPDATE SET enabled = EXCLUDED.enabled`,
        [owner, enabled],
      );
      return { enabled };
    });
  }

  learning(owner: string) {
    return this.database(async (pool) => {
      const { rows: [preference] } = await pool.query<{ enabled: boolean; items: LearnedFact[] }>(
        `SELECT learning_enabled AS enabled, ARRAY(
           SELECT jsonb_build_object('kind', key, 'value', item->>'value')
           FROM jsonb_each(learned_context) AS facts(key, item)
           WHERE item->>'expiresAt' IS NULL OR (item->>'expiresAt')::timestamptz > now()
           ORDER BY key
         ) AS items FROM visitor_memory WHERE owner_hash = $1`, [owner],
      );
      return preference ?? { enabled: false, items: [] };
    });
  }

  setLearning(owner: string, enabled: boolean) {
    return this.database(async (pool) => {
      await pool.query(
        `INSERT INTO visitor_memory (owner_hash, enabled, learning_enabled) VALUES ($1, false, $2)
         ON CONFLICT (owner_hash) DO UPDATE SET learning_enabled = EXCLUDED.learning_enabled,
           learned_context = CASE WHEN EXCLUDED.learning_enabled THEN visitor_memory.learned_context ELSE '{}'::jsonb END`,
        [owner, enabled],
      );
      return { enabled };
    });
  }

  learningEnabled(owner: string) {
    return this.database(async (pool) => {
      const { rows: [preference] } = await pool.query<{ enabled: boolean }>(
        'SELECT learning_enabled AS enabled FROM visitor_memory WHERE owner_hash = $1', [owner],
      );
      return preference?.enabled ?? false;
    });
  }

  async rememberIfEnabled(owner: string, fact: LearnedFact, expiresInDays: number | null) {
    if (!this.pool) return false;
    try {
      const { rowCount } = await this.pool.query(
        `UPDATE visitor_memory SET learned_context = learned_context || jsonb_build_object($2::text,
           jsonb_build_object('value', $3::text, 'expiresAt',
             now() + ($4::int * interval '1 day')))
         WHERE owner_hash = $1 AND learning_enabled`,
        [owner, fact.kind, fact.value, expiresInDays],
      );
      return rowCount === 1;
    } catch {
      this.logger.warn('Memória de perfil indisponível.');
      return false;
    }
  }

  offerToday(owner: string) {
    const date = dailyDate();
    return this.database(async (pool) => {
      const result = await pool.query(
        `INSERT INTO daily_check_ins (owner_hash, check_in_date) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [owner, date],
      );
      return { date, show: result.rowCount === 1 };
    });
  }

  saveCheckIn(owner: string, { date, mood, topic }: ReturnType<typeof readCheckIn>) {
    if (date !== dailyDate()) throw new ConflictException({ error: 'check_in_closed' });

    return this.database(async (pool) => {
      const result = await pool.query(
        `UPDATE daily_check_ins SET mood = $3, topic = $4, state = 'answered'
         WHERE owner_hash = $1 AND check_in_date = $2
           AND (state = 'offered' OR (state = 'answered' AND mood = $3 AND topic = $4))`,
        [owner, date, mood, topic],
      );
      if (!result.rowCount) throw new ConflictException({ error: 'check_in_closed' });
    });
  }

  clearCheckIns(owner: string) {
    return this.database(async (pool) => {
      await pool.query(
        `WITH cleared_today AS (
           UPDATE daily_check_ins SET mood = NULL, topic = NULL, state = 'dismissed'
           WHERE owner_hash = $1 AND check_in_date = $2
         )
         DELETE FROM daily_check_ins WHERE owner_hash = $1 AND check_in_date < $2`,
        [owner, dailyDate()],
      );
    });
  }

  async chatContext(owner: string, topic: string) {
    if (!this.pool) return undefined;
    try {
      const { rows: [context] } = await this.pool.query<PersonalContext>(
        `WITH today AS (
           SELECT mood, topic FROM daily_check_ins
           WHERE owner_hash = $1 AND check_in_date = $2 AND state = 'answered'
         ), memory AS (
           SELECT owner_hash FROM visitor_memory WHERE owner_hash = $1 AND enabled
         )
         SELECT (SELECT name FROM visitor_profiles JOIN memory USING (owner_hash)) AS name,
           (SELECT row_to_json(today) FROM today) AS today,
           ARRAY(
             SELECT json_build_object('mood', mood, 'topic', topic, 'date', check_in_date::text)
             FROM daily_check_ins JOIN memory USING (owner_hash)
             WHERE check_in_date >= $2::date - 30 AND check_in_date < $2::date AND state = 'answered'
               AND topic = CASE WHEN $3 = 'general' THEN (SELECT topic FROM today) ELSE $3 END
             ORDER BY check_in_date DESC LIMIT 3
           ) AS "recentCheckIns",
           ARRAY(
             SELECT title FROM chat_sessions JOIN memory USING (owner_hash)
             WHERE topic = $3 AND updated_at >= $2::date - 30
             ORDER BY updated_at DESC, id LIMIT 2
           ) AS "savedQuestions",
           ARRAY(
             SELECT jsonb_build_object('kind', key, 'value', item->>'value')
             FROM visitor_memory CROSS JOIN LATERAL jsonb_each(learned_context) AS facts(key, item)
             WHERE owner_hash = $1 AND learning_enabled
               AND (item->>'expiresAt' IS NULL OR (item->>'expiresAt')::timestamptz > now())
               AND key = ANY($4::text[])
             ORDER BY key
           ) AS learned`,
        [owner, dailyDate(), topic, relevantLearnedKinds(topic)],
      );
      if (!context.learned?.length) delete context.learned;
      if (context.name || context.today || context.recentCheckIns.length || context.savedQuestions.length || context.learned) return context;
    } catch {
      this.logger.warn('Contexto pessoal da consulta indisponível.');
    }
    return undefined;
  }

  private async database<T>(operation: (pool: Pool) => Promise<T>) {
    if (!this.pool) throw new ServiceUnavailableException({ error: 'profile_unavailable' });
    try {
      return await operation(this.pool);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn('Falha no acesso aos dados do perfil.');
      throw new ServiceUnavailableException({ error: 'profile_unavailable' });
    }
  }
}
