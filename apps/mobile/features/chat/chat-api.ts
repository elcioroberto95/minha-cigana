import { apiUrl } from '../../lib/api-url';
import type { AppLocale } from '../../localization';
import type { Topic } from '../tarot/domain';

export type ChatMessage = { role: 'user' | 'assistant'; content: string; model?: string | null };

export async function requestReply(input: {
  locale: AppLocale;
  topic: Topic;
  message: string;
  history: ChatMessage[];
}, signal: AbortSignal): Promise<{ reply: string; model: string }> {
  const response = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Chat unavailable');
  const { reply, model } = await response.json() as { reply?: unknown; model?: unknown };
  if (typeof reply !== 'string' || !reply.trim() || typeof model !== 'string') throw new Error('Invalid chat reply');
  return { reply, model };
}
