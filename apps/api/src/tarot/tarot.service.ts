import { HttpException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { OllamaService } from '../chat/ollama.service.js';
import { localizedCards, readingPrompt, shuffleSelection, type SelectedCard } from './deck.js';
import type { readDraw } from './tarot-input.js';

type Input = ReturnType<typeof readDraw>;
type Draw = Omit<Input, 'slots'> & { cards: SelectedCard[]; reading: string | null; model: string | null };

function present(draw: Draw) {
  return {
    id: draw.id, format: draw.format, topic: draw.topic,
    cards: localizedCards(draw.format, draw.cards, draw.locale),
    reading: draw.reading,
  };
}

@Injectable()
export class TarotService implements OnModuleDestroy {
  private readonly logger = new Logger(TarotService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000, max: 4 })
    : undefined;
  private readonly inFlight = new Map<string, Promise<Draw>>();

  constructor(private readonly ollama: OllamaService) {
    this.pool?.on('error', () => this.logger.warn('Conexão da tiragem interrompida.'));
  }

  onModuleDestroy() {
    return this.pool?.end();
  }

  async draw(owner: string, { id, format, locale, topic, question, slots }: Input) {
    const draw = await this.database(async (pool) => {
      const cards = shuffleSelection(format, slots);
      const { rows: [created] } = await pool.query<Draw>(
        `INSERT INTO tarot_draws (id, owner_hash, format, locale, topic, question, cards)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) ON CONFLICT DO NOTHING
         RETURNING id, format, locale, topic, question, cards, reading, model`,
        [id, owner, format, locale, topic, question, JSON.stringify(cards)],
      );
      return created ?? this.find(owner, id);
    });
    return present(draw);
  }

  async get(owner: string, id: string) {
    return present(await this.find(owner, id));
  }

  async interpret(owner: string, id: string) {
    const key = owner + ':' + id;
    let pending = this.inFlight.get(key);
    if (!pending) {
      pending = this.find(owner, id)
        .then((draw) => draw.reading ? draw : this.generate(owner, draw))
        .finally(() => this.inFlight.delete(key));
      this.inFlight.set(key, pending);
    }
    return present(await pending);
  }

  private async generate(owner: string, draw: Draw) {
    const { id, format, locale, topic, question, cards } = draw;
    const { reply, model } = await this.ollama.interpret({ locale, topic, message: readingPrompt(format, cards, locale, question) });
    return this.database(async (pool) => {
      const { rows: [updated] } = await pool.query<Draw>(
        `UPDATE tarot_draws SET reading = $3, model = $4
         WHERE owner_hash = $1 AND id = $2 AND reading IS NULL
         RETURNING id, format, locale, topic, question, cards, reading, model`,
        [owner, id, reply, model],
      );
      return updated ?? this.find(owner, id);
    });
  }

  private find(owner: string, id: string) {
    return this.database(async (pool) => {
      const { rows: [draw] } = await pool.query<Draw>(
        'SELECT id, format, locale, topic, question, cards, reading, model FROM tarot_draws WHERE owner_hash = $1 AND id = $2',
        [owner, id],
      );
      if (!draw) throw new NotFoundException();
      return draw;
    });
  }

  private async database<T>(operation: (pool: Pool) => Promise<T>) {
    if (!this.pool) throw new ServiceUnavailableException({ error: 'tarot_unavailable' });
    try {
      return await operation(this.pool);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn('Falha no acesso aos dados da tiragem.');
      throw new ServiceUnavailableException({ error: 'tarot_unavailable' });
    }
  }
}
