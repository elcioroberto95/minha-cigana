export const topics = ['love', 'money', 'work', 'future', 'spirituality', 'general'] as const;
export type Topic = (typeof topics)[number];

export const spreadSizes = { 'tres-cartas': 3, 'sim-ou-nao': 1, 'dez-cartas': 10 } as const;
export type Spread = keyof typeof spreadSizes;

export const spreadLabels = { 'tres-cartas': 'threeCards', 'sim-ou-nao': 'yesNoSpread', 'dez-cartas': 'tenCardReading' } as const;

export function isTopic(value: unknown): value is Topic {
  return topics.some((topic) => topic === value);
}

export function isSpread(value: unknown): value is Spread {
  return typeof value === 'string' && Object.hasOwn(spreadSizes, value);
}
