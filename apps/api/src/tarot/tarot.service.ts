import { HttpException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import { Pool } from 'pg';
import type { ChatLocale } from '../chat/domain/consultation.js';
import { OllamaService } from '../chat/ollama.service.js';
import { requestContext } from '../observability/request-context.js';
import { localizedCards, readingPrompt, shuffleSelection, type SelectedCard } from './deck.js';
import { readStructuredReading, structuredReadingSchema, type StructuredReading } from './structured-reading.js';
import { createThreeCardGraph } from './three-card-graph.js';
import type { readDraw } from './tarot-input.js';

type Input = ReturnType<typeof readDraw>;
type Draw = Omit<Input, 'slots'> & {
  cards: SelectedCard[];
  reading: string | null;
  structuredReading: StructuredReading | null;
  model: string | null;
};

function present(draw: Draw) {
  return {
    id: draw.id, format: draw.format, topic: draw.topic,
    cards: localizedCards(draw.format, draw.cards, draw.locale),
    reading: draw.reading,
    ...(draw.structuredReading && { structuredReading: draw.structuredReading }),
  };
}

@Injectable()
export class TarotService implements OnModuleDestroy {
  private readonly logger = new Logger(TarotService.name);
  private readonly pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5_000, max: 4 })
    : undefined;
  private readonly inFlight = new Map<string, Promise<Draw>>();
  private readonly threeCardGraph: ReturnType<typeof createThreeCardGraph>;

  constructor(private readonly ollama: OllamaService) {
    this.threeCardGraph = createThreeCardGraph((prompt, schema, signal) => this.ollama.interpretStructured(prompt, schema, signal));
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
         RETURNING id, format, locale, topic, question, cards, reading, structured_reading AS "structuredReading", model`,
        [id, owner, format, locale, topic, question, JSON.stringify(cards)],
      );
      return created ?? this.find(owner, id);
    });
    return present(draw);
  }

  async get(owner: string, id: string) {
    return present(await this.find(owner, id));
  }

  async consultationContext(owner: string, id: string, locale: ChatLocale) {
    const draw = await this.find(owner, id);
    await this.recordPilotEvent(owner, id, 'chat_continued').catch(() => {});
    return {
      topic: draw.topic, question: draw.question,
      cards: localizedCards(draw.format, draw.cards, locale).map(({ card, position, orientation }) => ({ name: card.name, position, orientation })),
    };
  }

  async recordPilotEvent(owner: string, id: string, event: 'audio_started' | 'chat_continued') {
    await this.database(async (pool) => {
      await pool.query(
        `INSERT INTO tarot_pilot_events (draw_id, event)
         SELECT id, $3 FROM tarot_draws WHERE owner_hash = $1 AND id = $2 AND reading IS NOT NULL
         ON CONFLICT DO NOTHING`, [owner, id, event],
      );
    });
  }

  async recordPilotStart(owner: string, id: string) {
    await this.database(async (pool) => {
      await pool.query('INSERT INTO tarot_pilot_attempts (id, owner_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, owner]);
    });
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
    const schema = format === 'tres-cartas' ? structuredReadingSchema(cards) : undefined;
    const prompt = { locale, topic, message: readingPrompt(format, cards, locale, question) };
    const graph = schema && process.env.TAROT_INTERPRETER === 'langgraph';
    const started = performance.now();
    const generated = graph ? await this.threeCardGraph(prompt, cards)
      : await this.ollama.interpret(prompt, schema).then((result) => ({
        ...result, structuredReading: schema ? readStructuredReading(result.reply, cards) : undefined,
      }));
    if (!generated || (schema && !generated.structuredReading)) {
      this.logger.warn({ event: 'tarot.structured_reading.invalid', request_id: requestContext.getStore(),
        interpreter: graph ? 'langgraph' : 'http' });
      throw new ServiceUnavailableException({ error: 'tarot_unavailable' });
    }
    const { reply, model, structuredReading } = generated;
    const generationMs = Math.round(performance.now() - started);
    const hourlyRate = Number(process.env.PILOT_COMPUTE_COST_PER_HOUR_BRL);
    const cost = Number.isFinite(hourlyRate) && hourlyRate > 0 ? generationMs / 3_600_000 * hourlyRate : null;
    const reading = structuredReading
      ? [
        ...localizedCards(format, cards, locale).map(({ card, position }, index) =>
          position + ' — ' + card.name + '\n' + structuredReading.cards[index].interpretation),
        structuredReading.summary,
        structuredReading.advice,
      ].join('\n\n')
      : reply;
    return this.database(async (pool) => {
      const { rows: [updated] } = await pool.query<Draw>(
        `UPDATE tarot_draws SET reading = $3, model = $4, structured_reading = $5::jsonb,
         pilot_completed_at = now(), generation_ms = $6, estimated_compute_cost_brl = $7
         WHERE owner_hash = $1 AND id = $2 AND reading IS NULL
         RETURNING id, format, locale, topic, question, cards, reading, structured_reading AS "structuredReading", model`,
        [owner, id, reading, model, structuredReading ?? null, generationMs, cost],
      );
      return updated ?? this.find(owner, id);
    });
  }

  private find(owner: string, id: string) {
    return this.database(async (pool) => {
      const { rows: [draw] } = await pool.query<Draw>(
        `SELECT id, format, locale, topic, question, cards, reading, structured_reading AS "structuredReading", model
         FROM tarot_draws WHERE owner_hash = $1 AND id = $2`,
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
