import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { EditorialReading } from '../daily-card/daily-card-catalog.js';
import { ApiMetrics } from '../observability/api-metrics.js';
import { requestContext } from '../observability/request-context.js';
import type { readChatInput } from './chat-input.js';
import { defaultPersona } from './persona.js';

type OllamaResult = {
  message?: { content?: unknown };
  model?: unknown;
  total_duration?: unknown;
  load_duration?: unknown;
  prompt_eval_duration?: unknown;
  eval_duration?: unknown;
  prompt_eval_count?: unknown;
  eval_count?: unknown;
};

function milliseconds(nanoseconds: unknown) {
  if (typeof nanoseconds === 'number' && Number.isFinite(nanoseconds) && nanoseconds >= 0) {
    return Math.round(nanoseconds / 1_000_000);
  }
  return undefined;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  constructor(private readonly metrics: ApiMetrics) {}

  async reply({ locale, topic, message, history }: ReturnType<typeof readChatInput>, daily?: EditorialReading) {
    const model = process.env.OLLAMA_MODEL?.trim();
    const startedAt = performance.now();
    const logContext = { event: 'ollama.chat.completed', request_id: requestContext.getStore(), model: model || undefined };
    let outcome = 'not_configured';
    let upstreamStatus: number | undefined;
    let signal: AbortSignal | undefined;

    try {
      if (!model) throw new Error('Missing model');
      outcome = 'configuration_error';
      const base = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
      const persona = process.env.CHAT_PERSONA_FILE
        ? await readFile(process.env.CHAT_PERSONA_FILE, 'utf8')
        : defaultPersona;
      const context = daily
        ? `\nCarta do Dia já revelada: ${daily.title}. Reflexão editorial: ${daily.reflection} Use essa carta como contexto simbólico.`
        : '';
      const url = new URL('/api/chat', base);
      outcome = 'connection_error';
      signal = AbortSignal.timeout(90_000);
      this.metrics.startInference();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'error',
        signal,
        body: JSON.stringify({
          model,
          stream: false,
          options: { num_predict: 256 },
          messages: [
            { role: 'system', content: `${persona}\nIdioma da resposta: ${locale}. Tema sugerido: ${topic}.${context}` },
            ...history,
            { role: 'user', content: message },
          ],
        }),
      });

      upstreamStatus = response.status;
      if (!response.ok) {
        outcome = 'upstream_http_error';
        throw new Error('Ollama request failed');
      }
      outcome = 'invalid_response';
      const result = await response.json() as OllamaResult | null;
      const content = result?.message?.content;
      if (!result || typeof content !== 'string' || !content.trim()) throw new Error('Invalid Ollama response');

      outcome = 'ok';
      this.metrics.recordOllamaMeasurements(result);
      this.logger.log({
        ...logContext,
        outcome,
        upstream_status: upstreamStatus,
        duration_ms: Math.round(performance.now() - startedAt),
        ollama_total_ms: milliseconds(result?.total_duration),
        model_load_ms: milliseconds(result?.load_duration),
        prompt_eval_ms: milliseconds(result?.prompt_eval_duration),
        generation_ms: milliseconds(result?.eval_duration),
      });
      return {
        reply: content.trim().slice(0, 2000),
        model: typeof result?.model === 'string' ? result.model : model,
      };
    } catch {
      if (signal?.aborted) outcome = 'timeout';
      this.logger.warn({
        ...logContext,
        outcome,
        upstream_status: upstreamStatus,
        duration_ms: Math.round(performance.now() - startedAt),
      });
      throw new ServiceUnavailableException({ error: 'chat_unavailable' });
    } finally {
      if (signal) this.metrics.finishInference();
      this.metrics.recordInference(outcome, performance.now() - startedAt);
    }
  }
}
