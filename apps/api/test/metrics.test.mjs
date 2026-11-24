import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MetricReader } from '@opentelemetry/sdk-metrics';
import { ApiMetrics } from '../dist/observability/api-metrics.js';

class TestReader extends MetricReader {
  async onForceFlush() {}
  async onShutdown() {}
}

test('registra tráfego, falhas, latência em segundos e saturação', async () => {
  const reader = new TestReader();
  const metrics = new ApiMetrics(reader);
  async function snapshot() {
    const { resourceMetrics, errors } = await reader.collect();
    assert.deepEqual(errors, []);
    return new Map(resourceMetrics.scopeMetrics.flatMap((scope) => scope.metrics)
      .map((metric) => [metric.descriptor.name, metric.dataPoints]));
  }

  try {
    metrics.startHttp();
    metrics.finishHttp('POST', '/api/chat', 200, 250);
    metrics.startHttp();
    metrics.finishHttp('POST', '/api/chat', 503, 90_000);
    metrics.recordInference('timeout', 90_000);
    metrics.recordOllamaMeasurements({ eval_duration: 1e9, prompt_eval_count: 24, eval_count: 8 });
    metrics.observeHistoryPool({ totalCount: 3, idleCount: 1, waitingCount: 2 });
    metrics.recordHistory('list', 'ok', 2);
    metrics.startHttp();
    metrics.startInference();
    const points = await snapshot();
    const requests = points.get('cigana_http_requests');
    assert.deepEqual(Object.fromEntries(requests.map(({ value, attributes }) => [attributes.status_class, value])),
      { '2xx': 1, '5xx': 1 });
    const latency = points.get('cigana_http_request_duration');
    assert.equal(latency.find(({ attributes }) => attributes.status_class === '2xx').value.sum, 0.25);
    assert.equal(latency.find(({ attributes }) => attributes.status_class === '5xx').value.sum, 90);
    assert.equal(points.get('cigana_ollama_request_duration')[0].attributes.outcome, 'timeout');
    assert.equal(points.get('cigana_ollama_in_flight')[0].value, 1);
    assert.equal(points.get('cigana_http_in_flight')[0].value, 1);
    assert.equal(points.get('cigana_ollama_stage_duration')[0].value.sum, 1);
    assert.deepEqual(Object.fromEntries(points.get('cigana_ollama_tokens')
      .map(({ value, attributes }) => [attributes.kind, value])), { prompt: 24, generated: 8 });
    assert.equal(points.get('cigana_history_pool_waiting')[0].value, 2);
    assert.equal(points.get('cigana_history_database_operations')[0].attributes.operation, 'list');
    metrics.finishInference();
    metrics.finishHttp('POST', '/api/chat', 499, 5);
    const completed = await snapshot();
    assert.equal(completed.get('cigana_ollama_in_flight')[0].value, 0);
    assert.equal(completed.get('cigana_http_in_flight')[0].value, 0);
  } finally {
    await metrics.onModuleDestroy();
  }
});
