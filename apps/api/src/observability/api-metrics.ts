import { randomUUID } from 'node:crypto';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { memoryUsage } from 'node:process';
import type { OnModuleDestroy } from '@nestjs/common';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { AggregationType, MeterProvider } from '@opentelemetry/sdk-metrics';
import type { MetricReader } from '@opentelemetry/sdk-metrics';

const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 45, 60, 90, 120];
const httpDuration = 'cigana_http_request_duration';
const ollamaDuration = 'cigana_ollama_request_duration';
const stageDuration = 'cigana_ollama_stage_duration';
const databaseDuration = 'cigana_history_database_duration';

type OllamaMeasurements = {
  load_duration?: unknown;
  prompt_eval_duration?: unknown;
  eval_duration?: unknown;
  prompt_eval_count?: unknown;
  eval_count?: unknown;
};

type HistoryPool = { totalCount: number; idleCount: number; waitingCount: number };

export class ApiMetrics implements OnModuleDestroy {
  private readonly provider: MeterProvider;
  private readonly requests;
  private readonly requestDuration;
  private readonly inferenceRequests;
  private readonly inferenceDuration;
  private readonly inferenceStages;
  private readonly tokens;
  private readonly databaseOperations;
  private readonly databaseDuration;
  private readonly loopDelay;
  private httpInFlight = 0;
  private inferenceInFlight = 0;
  private historyPool?: HistoryPool;

  constructor(reader?: MetricReader) {
    this.provider = new MeterProvider({
      resource: resourceFromAttributes({ 'service.name': 'cigana-api', 'service.instance.id': randomUUID() }),
      readers: reader ? [reader] : [],
      views: [httpDuration, ollamaDuration, stageDuration, databaseDuration].map((instrumentName) => ({
        instrumentName,
        aggregation: { type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM, options: { boundaries: buckets } },
      })),
    });

    const meter = this.provider.getMeter('cigana-api');
    this.requests = meter.createCounter('cigana_http_requests', { description: 'Completed HTTP requests' });
    this.requestDuration = meter.createHistogram(httpDuration, { unit: 's', description: 'HTTP duration to finish or close' });
    this.inferenceRequests = meter.createCounter('cigana_ollama_requests', { description: 'Completed Ollama adapter calls' });
    this.inferenceDuration = meter.createHistogram(ollamaDuration, { unit: 's', description: 'Ollama adapter duration' });
    this.inferenceStages = meter.createHistogram(stageDuration, { unit: 's', description: 'Ollama internal stage duration' });
    this.tokens = meter.createCounter('cigana_ollama_tokens', { description: 'Prompt and generated tokens reported by Ollama' });
    this.databaseOperations = meter.createCounter('cigana_history_database_operations', { description: 'History storage operations' });
    this.databaseDuration = meter.createHistogram(databaseDuration, { unit: 's', description: 'History storage operation duration' });

    meter.createObservableGauge('cigana_http_in_flight').addCallback((gauge) => gauge.observe(this.httpInFlight));
    meter.createObservableGauge('cigana_ollama_in_flight').addCallback((gauge) => gauge.observe(this.inferenceInFlight));
    meter.createObservableGauge('cigana_history_pool_connections').addCallback((gauge) => {
      const pool = this.historyPool;
      if (!pool) return;
      gauge.observe(pool.idleCount, { state: 'idle' });
      gauge.observe(pool.totalCount - pool.idleCount, { state: 'busy' });
    });
    meter.createObservableGauge('cigana_history_pool_waiting').addCallback((gauge) => {
      if (this.historyPool) gauge.observe(this.historyPool.waitingCount);
    });

    if (reader) {
      const loopDelay = monitorEventLoopDelay({ resolution: 20 });
      this.loopDelay = loopDelay;
      loopDelay.enable();
      meter.createObservableGauge('cigana_api_event_loop_delay_p99', { unit: 's' }).addCallback((gauge) => {
        if (loopDelay.count > 0) gauge.observe(loopDelay.percentile(99) / 1e9);
        loopDelay.reset();
      });
      meter.createObservableGauge('cigana_api_resident_memory', { unit: 'By' })
        .addCallback((gauge) => gauge.observe(memoryUsage.rss()));
    }
  }

  startHttp() {
    this.httpInFlight++;
  }

  finishHttp(method: string, route: string, status: number, elapsedMs: number) {
    this.httpInFlight--;
    const attributes = { method, route, status_class: `${Math.floor(status / 100)}xx` };
    this.requests.add(1, { ...attributes, status_code: String(status) });
    this.requestDuration.record(elapsedMs / 1000, attributes);
  }

  recordInference(outcome: string, elapsedMs: number) {
    this.inferenceRequests.add(1, { outcome });
    this.inferenceDuration.record(elapsedMs / 1000, { outcome });
  }

  recordOllamaMeasurements(result: OllamaMeasurements) {
    for (const [stage, duration] of Object.entries({
      model_load: result.load_duration, prompt_eval: result.prompt_eval_duration, generation: result.eval_duration,
    })) {
      if (typeof duration === 'number' && Number.isFinite(duration) && duration >= 0) {
        this.inferenceStages.record(duration / 1e9, { stage });
      }
    }
    for (const [kind, count] of Object.entries({ prompt: result.prompt_eval_count, generated: result.eval_count })) {
      if (typeof count === 'number' && Number.isSafeInteger(count) && count >= 0) {
        this.tokens.add(count, { kind });
      }
    }
  }

  startInference() {
    this.inferenceInFlight++;
  }

  finishInference() {
    this.inferenceInFlight--;
  }

  observeHistoryPool(pool: HistoryPool) {
    this.historyPool = pool;
  }

  recordHistory(operation: string, outcome: string, elapsedMs: number) {
    this.databaseOperations.add(1, { operation, outcome });
    this.databaseDuration.record(elapsedMs / 1000, { operation, outcome });
  }

  async onModuleDestroy() {
    this.loopDelay?.disable();
    await this.provider.shutdown();
  }
}
