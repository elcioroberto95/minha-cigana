import { performance } from 'node:perf_hooks';
import { Logger } from '@nestjs/common';
import { OllamaService } from '../dist/chat/ollama.service.js';
import { ApiMetrics } from '../dist/observability/api-metrics.js';
import { readingPrompt } from '../dist/tarot/deck.js';
import { readStructuredReading, structuredReadingSchema } from '../dist/tarot/structured-reading.js';
import { createThreeCardGraph } from '../dist/tarot/three-card-graph.js';

const fixtures = [
  {
    id: 'trabalho-pt', locale: 'pt-BR', topic: 'work', question: 'Como posso me preparar para mudar de área?',
    cards: [{ id: 'maior-9', orientation: 'normal' }, { id: 'maior-14', orientation: 'normal' }, { id: 'maior-18', orientation: 'invertida' }],
  },
  {
    id: 'future-en', locale: 'en-US', topic: 'future', question: 'Will I definitely move to another city next month?',
    cards: [{ id: 'maior-16', orientation: 'invertida' }, { id: 'maior-11', orientation: 'normal' }, { id: 'maior-17', orientation: 'normal' }],
  },
];

Logger.overrideLogger(false);
const metrics = new ApiMetrics();
const ollama = new OllamaService(metrics);
const runGraph = createThreeCardGraph((prompt, schema, signal) => ollama.interpretStructured(prompt, schema, signal));

async function measure(run) {
  const startedAt = performance.now();
  try {
    const result = await run();
    return { elapsedMs: Math.round(performance.now() - startedAt), ...result, valid: Boolean(result?.structuredReading) };
  } catch {
    return { elapsedMs: Math.round(performance.now() - startedAt), valid: false, error: 'generation_failed' };
  }
}

try {
  const startedAt = new Date().toISOString();
  const results = [];
  for (const { id, cards, locale, topic, question } of fixtures) {
    const prompt = { locale, topic, message: readingPrompt('tres-cartas', cards, locale, question) };
    const legacy = () => measure(async () => {
      const { model, reply } = await ollama.interpret(prompt, structuredReadingSchema(cards));
      return { model, structuredReading: readStructuredReading(reply, cards) };
    });
    const graph = () => measure(() => runGraph(prompt, cards));
    // Alternate which path runs first to make model warm-up less asymmetric.
    const [first, second] = results.length % 2 === 0 ? [legacy, graph] : [graph, legacy];
    const firstResult = await first();
    const secondResult = await second();
    const [http, langgraph] = first === legacy ? [firstResult, secondResult] : [secondResult, firstResult];
    results.push({ id, locale, topic, question, cards, http, langgraph });
  }
  console.log(JSON.stringify({ startedAt, results }, null, 2));
  if (results.some(({ http, langgraph }) => !http.valid || !langgraph.valid)) process.exitCode = 1;
} finally {
  await metrics.onModuleDestroy();
}
