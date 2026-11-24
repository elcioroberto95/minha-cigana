import { apiFetch } from '../../lib/api-url';
import { clearSession, getAccountToken, storeSession } from '../../lib/session-token';
import { getOrCreateVisitorToken, removeVisitorToken } from '../../lib/visitor-token';
import type { Profile } from './profile-api';

type Credentials = { email: string; password: string };
type AuthError = 'authInvalid' | 'authConflict' | 'authRejected' | 'authRateLimited';

async function authenticate(path: 'register' | 'login', body: Credentials, visitor?: string): Promise<AuthError | undefined> {
  const response = await apiFetch('/api/auth/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(visitor ? { Authorization: 'Bearer ' + visitor } : {}) },
    body: JSON.stringify(body),
  });
  if (response.status === 400) return 'authInvalid';
  if (response.status === 409) return 'authConflict';
  if (response.status === 429) return 'authRateLimited';
  if (response.status === 401) return path === 'register' ? 'authConflict' : 'authRejected';
  if (!response.ok) throw new Error('Unable to authenticate');

  const { token } = await response.json() as { token: string };
  await storeSession(token);
  if (visitor) await removeVisitorToken(visitor).catch(() => {});
}

export async function register(profile: Profile, password: string) {
  return authenticate('register', { ...profile, password }, await getOrCreateVisitorToken());
}

export async function login(credentials: Credentials) {
  return authenticate('login', credentials);
}

export async function logout() {
  const token = getAccountToken();
  if (!token) return;
  const response = await apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!response.ok && response.status !== 401) throw new Error('Unable to log out');
  await clearSession(token);
}
