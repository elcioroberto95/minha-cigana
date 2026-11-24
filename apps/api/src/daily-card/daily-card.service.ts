import { randomInt, randomUUID } from 'node:crypto';
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { dailyCatalog, type EditorialCard } from './daily-card-catalog.js';
import { dailyDate } from './daily-date.js';

type Draw = { id: string; date: string; card: EditorialCard };

@Injectable()
export class DailyCardService implements OnModuleDestroy {
  private readonly logger = new Logger(DailyCardService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000, max: 4 })
    : undefined;

  constructor() {
    this.pool?.on('error', () => this.logger.warn('Conexão da Carta do Dia interrompida.'));
  }

  onModuleDestroy() {
    return this.pool?.end();
  }

  async today(owner: string) {
    const date = dailyDate();
    return this.database((pool) => this.findByDay(pool, owner, date));
  }

  async reveal(owner: string) {
    const date = dailyDate();
    return this.database(async (pool) => {
      const existing = await this.findByDay(pool, owner, date);
      if (existing) return existing;

      const card = dailyCatalog[randomInt(dailyCatalog.length)];
      const { rows: [created] } = await pool.query<Draw>(
        `INSERT INTO daily_draws (id, owner_hash, draw_date, card)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (owner_hash, draw_date) DO NOTHING
         RETURNING id, draw_date::text AS date, card`,
        [randomUUID(), owner, date, JSON.stringify(card)],
      );
      if (created) return created;

      // A consulta seguinte enxerga o registro da requisição que ganhou o INSERT.
      const winner = await this.findByDay(pool, owner, date);
      if (!winner) throw new Error('Missing daily draw after conflict');
      return winner;
    });
  }

  async ownedCard(owner: string, id: string) {
    const draw = await this.database(async (pool) => {
      const { rows: [found] } = await pool.query<Draw>(
        'SELECT id, draw_date::text AS date, card FROM daily_draws WHERE owner_hash = $1 AND id = $2',
        [owner, id],
      );
      return found;
    });
    if (!draw) throw new NotFoundException();
    return draw.card;
  }

  private async findByDay(pool: Pool, owner: string, date: string) {
    const { rows: [draw] } = await pool.query<Draw>(
      'SELECT id, draw_date::text AS date, card FROM daily_draws WHERE owner_hash = $1 AND draw_date = $2',
      [owner, date],
    );
    return draw ?? null;
  }

  private async database<T>(operation: (pool: Pool) => Promise<T>) {
    if (!this.pool) throw new ServiceUnavailableException({ error: 'daily_card_unavailable' });
    try {
      return await operation(this.pool);
    } catch {
      this.logger.warn('Falha no acesso à Carta do Dia.');
      throw new ServiceUnavailableException({ error: 'daily_card_unavailable' });
    }
  }
}
