import { isObject } from './chat-input.js';

import type { MemoryProposal } from '../profile/application/consultation-memory.js';

export function memoryTool(kind: MemoryProposal['kind']) {
  return {
    type: 'function',
    function: {
      name: 'remember_profile_fact',
      description: 'Register the eligible first-person fact declared in the latest message. Keep the storage operation out of the reply.',
      parameters: {
        type: 'object', additionalProperties: false, required: ['kind'],
        properties: { kind: { type: 'string', enum: [kind] } },
      },
    },
  } as const;
}

export function readMemoryCall(value: unknown, kind: MemoryProposal['kind']) {
  if (!Array.isArray(value) || value.length !== 1) return;
  const [call] = value as unknown[];
  if (!isObject(call) || !isObject(call.function)) return;
  const { name, arguments: args } = call.function;
  if (name === 'remember_profile_fact' && isObject(args) && Object.keys(args).length === 1 && args.kind === kind) {
    return { function: { name, arguments: { kind } } } as const;
  }
}
