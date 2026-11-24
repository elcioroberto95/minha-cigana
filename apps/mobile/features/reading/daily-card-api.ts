import { getOrCreateIdentityToken, getIdentityToken, identityFetch } from '../../lib/session-token';
import type { AppLocale } from '../../localization';

type Reading = { title: string; theme: string; reflection: string; action: string };
export type DailyDraw = { id: string; date: string; card: { key: string; numeral: string; readings: Record<AppLocale, Reading> } };

async function dailyRequest(token: string, method: 'GET' | 'POST', signal?: AbortSignal) {
  const response = await identityFetch('/api/tarot/daily', token, {
    method,
    signal,
  });
  if (!response.ok) throw new Error('Daily card unavailable');
  const { draw } = await response.json() as { draw: DailyDraw | null };
  return draw;
}

export async function getDailyCard(signal: AbortSignal) {
  const token = await getIdentityToken();
  return token ? dailyRequest(token, 'GET', signal) : null;
}

export async function revealDailyCard(signal: AbortSignal) {
  const draw = await dailyRequest(await getOrCreateIdentityToken(), 'POST', signal);
  if (!draw) throw new Error('Missing revealed card');
  return draw;
}
