import { Platform } from 'react-native';
import type { AppLocale } from '../../localization';
import type { Topic } from '../tarot/domain';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function requestReply(input: {
  locale: AppLocale;
  topic: Topic;
  message: string;
  history: ChatMessage[];
}, signal: AbortSignal): Promise<string> {
  const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  const base = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:3000`;
  const response = await fetch(new URL('/api/chat', base).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Chat unavailable');
  const { reply } = await response.json() as { reply?: unknown };
  if (typeof reply !== 'string' || !reply.trim()) throw new Error('Empty chat reply');
  return reply;
}
