import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { ConsultationPrompt } from '../chat/domain/consultation.js';
import type { SelectedCard } from './deck.js';
import { readStructuredReading, structuredReadingSchema, type StructuredReading } from './structured-reading.js';

type Prompt = Omit<ConsultationPrompt, 'history'>;
type Candidate = { reply: string; model: string };
type Generate = (prompt: Prompt, schema: Record<string, unknown>, signal: AbortSignal) => Promise<Candidate>;

const maxAttempts = 2;
const correction = '\nA resposta anterior foi rejeitada. Use somente o JSON solicitado. Copie os três IDs na ordem fornecida e escreva toda a leitura no idioma solicitado.';
const ReadingState = Annotation.Root({
  prompt: Annotation<Prompt>(),
  cards: Annotation<readonly SelectedCard[]>(),
  attempt: Annotation<number>(),
  candidate: Annotation<Candidate | null>(),
  reading: Annotation<StructuredReading | null>(),
});

export function createThreeCardGraph(generate: Generate) {
  const graph = new StateGraph(ReadingState)
    .addNode('generate', async ({ prompt, cards, attempt }, { signal }) => {
      if (!signal) throw new Error('Missing reading deadline');
      signal.throwIfAborted();
      const candidate = await generate({ ...prompt, message: attempt ? prompt.message + correction : prompt.message },
        structuredReadingSchema(cards), signal);
      return { candidate, attempt: attempt + 1 };
    })
    .addNode('validate', ({ candidate, cards }) => ({
      reading: candidate ? readStructuredReading(candidate.reply, cards) ?? null : null,
    }))
    .addEdge(START, 'generate')
    .addEdge('generate', 'validate')
    .addConditionalEdges('validate', ({ reading, attempt }) => reading || attempt >= maxAttempts ? END : 'generate', [END, 'generate'])
    .compile();

  return async (prompt: Prompt, cards: readonly SelectedCard[]) => {
    const signal = AbortSignal.timeout(90_000);
    try {
      const { reading, candidate, attempt } = await graph.invoke({ prompt, cards, attempt: 0, candidate: null, reading: null }, { signal });
      if (reading && candidate) return { ...candidate, structuredReading: reading, attempts: attempt };
    } catch (error) {
      if (!signal.aborted) throw error;
    }
    return undefined;
  };
}
