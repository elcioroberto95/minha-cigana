export const topics = ['love', 'money', 'work', 'future', 'spirituality', 'general'] as const;
export type Topic = (typeof topics)[number];

export const spreadSizes = { 'tres-cartas': 3, 'dez-cartas': 10 } as const;
export type Spread = keyof typeof spreadSizes;

export function isTopic(value: unknown): value is Topic {
  return topics.some((topic) => topic === value);
}

export function isSpread(value: unknown): value is Spread {
  return value === 'tres-cartas' || value === 'dez-cartas';
}
