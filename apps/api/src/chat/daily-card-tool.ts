import { isObject } from './chat-input.js';

export const dailyCardTool = {
  type: 'function',
  function: {
    name: 'get_daily_card',
    description: "Read the user's already revealed Card of the Day. Call this when the user asks about their own Card of the Day. If the result is not_revealed, invite them to reveal it in the Card of the Day screen. Use the returned title and reflection for a symbolic reading.",
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
} as const;

export function readDailyCardCall(value: unknown) {
  if (!Array.isArray(value) || value.length !== 1) return;
  const [call] = value as unknown[];
  if (!isObject(call) || !isObject(call.function)) return;
  const { name, arguments: args } = call.function;
  if (name === dailyCardTool.function.name && isObject(args) && Object.keys(args).length === 0) {
    return { function: { name, arguments: {} } } as const;
  }
}
