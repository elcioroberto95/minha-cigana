import { apiUrl } from '../../lib/api-url';
import { getOrCreateVisitorToken, getVisitorToken } from '../../lib/visitor-token';
import type { AppLocale } from '../../localization';

type Reading = { title: string; theme: string; reflection: string; action: string };
export type DailyDraw = { id: string; date: string; card: { key: string; numeral: string; readings: Record<AppLocale, Reading> } };

async function dailyRequest(token: string, method: 'GET' | 'POST', signal?: AbortSignal) {
  const response = await fetch(apiUrl('/api/tarot/daily'), {
    method,
    headers: { Authorization: 'Bearer ' + token },
    signal,
  });
  if (!response.ok) throw new Error('Daily card unavailable');
  const { draw } = await response.json() as { draw: DailyDraw | null };
  return draw;
}

export async function getDailyCard(signal: AbortSignal) {
  const token = await getVisitorToken();
  return token ? dailyRequest(token, 'GET', signal) : null;
}

export async function revealDailyCard(signal: AbortSignal) {
  const draw = await dailyRequest(await getOrCreateVisitorToken(), 'POST', signal);
  if (!draw) throw new Error('Missing revealed card');
  return draw;
}
