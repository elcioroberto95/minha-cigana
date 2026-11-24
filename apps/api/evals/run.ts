import { randomBytes, randomUUID } from 'node:crypto';
import { scenarios } from './cases.ts';
import type { ChatScenario, TarotScenario } from './cases.ts';

type Scenario = ChatScenario | TarotScenario;
type Call = {
  path: string;
  ms: number;
  status?: number;
  requestId?: string;
  error?: string;
};
type Check = { rule: string; passed: boolean; detail: string };
type Card = { card: { id: string; name: string }; position: string; orientation: 'normal' | 'invertida' };
type Result = {
  scenario: Scenario;
  calls: Call[];
  checks: Check[];
  outcome: 'error' | 'flagged' | 'ready_for_review';
  generationMs?: number;
  cards?: Card[];
  model?: string;
  answer?: string;
};

function getOrigin() {
  const url = new URL(process.env.EVAL_API_URL || 'http://127.0.0.1:3000');
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('EVAL_API_URL deve ser a origem HTTP de uma API local de desenvolvimento.');
  }
  return url.origin;
}

function object(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

async function post(result: Result, origin: string, path: string, payload?: object, visitor?: string) {
  const call: Call = { path, ms: 0 };
  result.calls.push(call);
  const started = performance.now();
  const signal = AbortSignal.timeout(105_000);
  try {
    const headers = new Headers();
    if (payload) headers.set('Content-Type', 'application/json');
    if (visitor) headers.set('Authorization', 'Bearer ' + visitor);
    const response = await fetch(origin + path, {
      method: 'POST', headers, body: payload ? JSON.stringify(payload) : undefined, redirect: 'error', signal,
    });
    call.status = response.status;
    call.requestId = response.headers.get('X-Request-ID') ?? undefined;
    const body: unknown = await response.json().catch((error: unknown) => {
      if (error instanceof SyntaxError) return undefined;
      throw error;
    });
    if (!response.ok) {
      const code = object(body).error;
      call.error = typeof code === 'string' ? code : 'http_error';
      return;
    }
    return object(body);
  } catch {
    call.error = signal.aborted ? 'timeout' : 'transport_error';
  } finally {
    call.ms = Math.round(performance.now() - started);
  }
}

function textField(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function contains(text: string, phrase: string) {
  function words(value: string) {
    return ' ' + value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
  }
  return words(text).includes(words(phrase));
}

function isDrawCard(value: unknown): value is Card {
  const { card, position, orientation } = object(value);
  return textField(object(card).id) && textField(object(card).name)
    && textField(position) && (orientation === 'normal' || orientation === 'invertida');
}

async function chat(origin: string, scenario: ChatScenario, result: Result) {
  const { locale, topic, question, history, expectedMention, forbiddenMention } = scenario;
  const response = await post(result, origin, '/api/chat', { locale, topic, message: question, history });
  if (!response) return;
  if (!textField(response.reply) || !textField(response.model)) {
    result.calls[0].error = 'invalid_chat_response';
    return;
  }
  result.answer = response.reply;
  result.model = response.model;
  if (expectedMention) {
    result.checks.push({ rule: 'memory_mention', passed: contains(response.reply, expectedMention), detail: expectedMention });
  }
  if (forbiddenMention) {
    result.checks.push({ rule: 'persona_marker', passed: !contains(response.reply, forbiddenMention), detail: forbiddenMention });
  }
}

async function tarot(origin: string, scenario: TarotScenario, result: Result) {
  const id = randomUUID();
  const visitor = randomBytes(32).toString('hex');
  const { locale, topic, question, format } = scenario;
  const counts = { 'tres-cartas': 3, 'sim-ou-nao': 1, 'dez-cartas': 10 };
  const draw = await post(result, origin, '/api/tarot/draw', { id, locale, topic, question, format }, visitor);
  if (!draw) return;
  const { cards } = draw;
  if (draw.id !== id || draw.format !== format || !Array.isArray(cards) || cards.length !== counts[format]
    || !cards.every(isDrawCard) || new Set(cards.map(({ card }) => card.id)).size !== cards.length) {
    result.calls[0].error = 'invalid_tarot_draw';
    return;
  }
  result.cards = cards;
  const interpretation = await post(result, origin, '/api/tarot/interpret/' + id, undefined, visitor);
  if (!interpretation) return;
  if (interpretation.id !== id || !textField(interpretation.reading)) {
    result.calls[1].error = 'invalid_tarot_interpretation';
    return;
  }
  const reading = interpretation.reading;
  result.answer = reading;
  const missing = cards.filter(({ card }) => !contains(reading, card.name)).map(({ card }) => card.name);
  result.checks.push({
    rule: 'drawn_card_names',
    passed: missing.length === 0,
    detail: missing.length ? 'Nomes ausentes: ' + missing.join(', ') : 'Todos os nomes aparecem no texto.',
  });
}

function latencySummary(samples: number[]) {
  if (!samples.length) return null;
  samples.sort((a, b) => a - b);
  const percentile = (p: number) => samples[Math.ceil(p * samples.length) - 1];
  return { count: samples.length, p50Ms: percentile(0.50), p95Ms: percentile(0.95) };
}

async function main() {
  const origin = getOrigin();
  const ids = process.argv.slice(2);
  const unknown = ids.filter((id) => !scenarios.some((scenario) => scenario.id === id));
  if (unknown.length) throw new Error('Casos desconhecidos: ' + unknown.join(', '));
  const selected = ids.length ? scenarios.filter(({ id }) => ids.includes(id)) : scenarios;
  const startedAt = new Date().toISOString();
  const results: Result[] = [];
  for (const scenario of selected) {
    const result: Result = { scenario, calls: [], checks: [], outcome: 'error' };
    if (scenario.kind === 'chat') await chat(origin, scenario, result);
    else await tarot(origin, scenario, result);
    if (result.answer !== undefined) {
      result.generationMs = result.calls.at(-1)?.ms;
      result.outcome = result.checks.some(({ passed }) => !passed) ? 'flagged' : 'ready_for_review';
    }
    results.push(result);
    console.error(`${scenario.id} ${result.outcome} (${result.calls.map(({ ms }) => ms).join(' + ')} ms)`);
  }

  const errors = results.filter(({ outcome }) => outcome === 'error').length;
  const flagged = results.filter(({ outcome }) => outcome === 'flagged').length;
  const report = {
    schemaVersion: 1,
    startedAt,
    origin,
    summary: {
      requested: selected.length,
      executed: results.length,
      errors,
      flagged,
      readyForReview: results.length - errors - flagged,
      latency: {
        chat: latencySummary(results.filter((r) => r.scenario.kind === 'chat').flatMap((r) => r.generationMs ?? [])),
        tarot: latencySummary(results.filter((r) => r.scenario.kind === 'tarot').flatMap((r) => r.generationMs ?? [])),
      },
    },
    results,
  };
  console.log(JSON.stringify(report, null, 2));
  if (errors) process.exitCode = 2;
  else if (flagged) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha ao iniciar a avaliação.');
  process.exitCode = 2;
});
