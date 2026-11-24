import { getIdentityToken, identityFetch } from '../../lib/session-token';
import type { AppLocale } from '../../localization';
import type { Topic } from '../tarot/domain';

export type ChatMessage = { role: 'user' | 'assistant'; content: string; model?: string | null };

export async function requestReply(input: {
  locale: AppLocale;
  topic: Topic;
  message: string;
  history: ChatMessage[];
  dailyCardId?: string;
}, signal: AbortSignal): Promise<{ reply: string; model: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = await getIdentityToken().catch(() => null);
  if (input.dailyCardId && !token) throw new Error('Missing visitor for daily card');
  const response = await identityFetch('/api/chat', token, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Chat unavailable');
  const { reply, model } = await response.json() as { reply?: unknown; model?: unknown };
  if (typeof reply !== 'string' || !reply.trim() || typeof model !== 'string') throw new Error('Invalid chat reply');
  return { reply, model };
}
