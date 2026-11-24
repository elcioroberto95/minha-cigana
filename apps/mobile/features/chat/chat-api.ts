import { apiUrl } from '../../lib/api-url';
import { getVisitorToken } from '../../lib/visitor-token';
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
  if (input.dailyCardId) {
    const token = await getVisitorToken();
    if (!token) throw new Error('Missing visitor for daily card');
    headers.Authorization = 'Bearer ' + token;
  }
  const response = await fetch(apiUrl('/api/chat'), {
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
