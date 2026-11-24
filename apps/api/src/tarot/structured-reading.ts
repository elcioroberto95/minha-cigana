import { isObject } from '../chat/chat-input.js';
import type { SelectedCard } from './deck.js';

const interpretationLimit = 280;
const summaryLimit = 360;
const adviceLimit = 240;

export type StructuredReading = {
  cards: { cardId: string; interpretation: string }[];
  summary: string;
  advice: string;
};

export function structuredReadingSchema(cards: readonly SelectedCard[]) {
  const text = (maxLength: number) => ({ type: 'string', minLength: 1, maxLength });
  return {
    type: 'object',
    additionalProperties: false,
    required: ['cards', 'summary', 'advice'],
    properties: {
      cards: {
        type: 'array',
        minItems: cards.length,
        maxItems: cards.length,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['cardId', 'interpretation'],
          properties: {
            cardId: { type: 'string', enum: cards.map(({ id }) => id) },
            interpretation: text(interpretationLimit),
          },
        },
      },
      summary: text(summaryLimit),
      advice: text(adviceLimit),
    },
  };
}

function readingText(value: unknown, limit: number) {
  if (typeof value !== 'string' || value.length > limit) return;
  return value.trim() || undefined;
}

export function readStructuredReading(content: string, cards: readonly SelectedCard[]): StructuredReading | undefined {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    return;
  }
  if (!isObject(value) || Object.keys(value).length !== 3 || !Array.isArray(value.cards)
    || value.cards.length !== cards.length) return;

  const summary = readingText(value.summary, summaryLimit);
  const advice = readingText(value.advice, adviceLimit);
  if (!summary || !advice) return;

  const interpretations: StructuredReading['cards'] = [];
  for (const [index, { id }] of cards.entries()) {
    const entry: unknown = value.cards[index];
    if (!isObject(entry) || Object.keys(entry).length !== 2 || entry.cardId !== id) return;
    const interpretation = readingText(entry.interpretation, interpretationLimit);
    if (!interpretation) return;
    interpretations.push({ cardId: id, interpretation });
  }
  return { cards: interpretations, summary, advice };
}
