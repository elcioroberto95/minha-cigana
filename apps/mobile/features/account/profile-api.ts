import { getOrCreateIdentityToken, getIdentityToken, identityFetch } from '../../lib/session-token';

export const sexes = ['female', 'male', 'other'] as const;
export const moods = ['calm', 'happy', 'worried', 'sad', 'tired', 'mixed'] as const;
export const checkInTopics = ['love', 'work', 'family', 'other'] as const;

export type Profile = { name: string; email: string; sex: (typeof sexes)[number] | null };
export type CheckIn = { date: string; mood: (typeof moods)[number]; topic: (typeof checkInTopics)[number] };
type Offer = { date: string; show: boolean };

function profileRequest(path: string, token: string, method = 'GET', body?: unknown, signal?: AbortSignal) {
  return identityFetch('/api/profile' + path, token, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function getProfile(signal: AbortSignal): Promise<Profile | null> {
  const token = await getIdentityToken();
  if (!token) return null;
  const response = await profileRequest('', token, 'GET', undefined, signal);
  if (!response.ok) throw new Error('Unable to load profile');
  const { profile } = await response.json() as { profile: Profile | null };
  return profile;
}

export async function saveProfile(profile: Profile) {
  const response = await profileRequest('', await getOrCreateIdentityToken(), 'PUT', profile);
  if (response.status === 400) return false;
  if (!response.ok) throw new Error('Unable to save profile');
  return true;
}

const pendingOffers = new Map<string, Promise<Offer>>();

export async function offerCheckIn() {
  const token = await getOrCreateIdentityToken();
  const pending = pendingOffers.get(token);
  if (pending) return pending;
  const offer = (async () => {
    const response = await profileRequest('/check-in/offer', token, 'POST');
    if (!response.ok) throw new Error('Unable to offer check-in');
    return response.json() as Promise<Offer>;
  })().finally(() => { pendingOffers.delete(token); });
  pendingOffers.set(token, offer);
  return offer;
}

export async function saveCheckIn(checkIn: CheckIn) {
  const response = await profileRequest('/check-in', await getOrCreateIdentityToken(), 'PUT', checkIn);
  if (response.status === 409) return;
  if (!response.ok) throw new Error('Unable to save check-in');
}

export async function getMemory(signal: AbortSignal): Promise<boolean> {
  const token = await getIdentityToken();
  if (!token) return false;
  const response = await profileRequest('/memory', token, 'GET', undefined, signal);
  if (!response.ok) throw new Error('Unable to load memory setting');
  const { enabled } = await response.json() as { enabled: boolean };
  return enabled;
}

export async function setMemory(enabled: boolean) {
  const response = await profileRequest('/memory', await getOrCreateIdentityToken(), 'PUT', { enabled });
  if (!response.ok) throw new Error('Unable to save memory setting');
}

type LearnedItem =
  | { kind: 'occupation'; value: string }
  | { kind: 'relationship'; value: 'married' | 'single' | 'divorced' }
  | { kind: 'career_goal'; value: 'change_jobs' | 'find_job' | 'start_business' | 'promotion' };
export type LearningPreference = { enabled: boolean; items: LearnedItem[] };

export async function getLearning(signal: AbortSignal): Promise<LearningPreference> {
  const token = await getIdentityToken();
  if (!token) return { enabled: false, items: [] };
  const response = await profileRequest('/memory/learning', token, 'GET', undefined, signal);
  if (!response.ok) throw new Error('Unable to load profile memory');
  return response.json();
}

export async function setLearning(enabled: boolean) {
  const response = await profileRequest('/memory/learning', await getOrCreateIdentityToken(), 'PUT', { enabled });
  if (!response.ok) throw new Error('Unable to save profile memory');
}

export async function deleteCheckIns() {
  const token = await getIdentityToken();
  if (!token) return;
  const response = await profileRequest('/check-in', token, 'DELETE');
  if (!response.ok) throw new Error('Unable to clear check-ins');
}
