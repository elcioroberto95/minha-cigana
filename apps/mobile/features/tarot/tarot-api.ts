import { getIdentityToken, getOrCreateIdentityToken, identityFetch } from '../../lib/session-token';
import type { AppLocale } from '../../localization';
import type { Spread, Topic } from './domain';

export type TarotDraw = {
  id: string;
  format: Spread;
  topic: Topic;
  cards: { card: { id: string; name: string }; position: string; orientation: 'normal' | 'invertida' }[];
  reading: string | null;
  structuredReading?: {
    cards: { cardId: string; interpretation: string }[];
    summary: string;
    advice: string;
  };
};

type NewDraw = { id: string; format: Spread; locale: AppLocale; topic: Topic; question: string; slots: number[] };

async function tarotRequest(path: string, token: string, options: RequestInit): Promise<TarotDraw> {
  const response = await identityFetch('/api/tarot/' + path, token, options);
  if (!response.ok) throw new Error('Tarot unavailable');
  return response.json();
}

export async function createDraw(draw: NewDraw, signal: AbortSignal) {
  return tarotRequest('draw', await getOrCreateIdentityToken(), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draw), signal,
  });
}

export async function readDraw(id: string, signal: AbortSignal) {
  const token = await getIdentityToken();
  if (!token) throw new Error('Missing visitor');
  return tarotRequest('draw/' + encodeURIComponent(id), token, { signal });
}

export async function interpretDraw(id: string, signal: AbortSignal) {
  const token = await getIdentityToken();
  if (!token) throw new Error('Missing visitor');
  return tarotRequest('interpret/' + encodeURIComponent(id), token, { method: 'POST', signal });
}
