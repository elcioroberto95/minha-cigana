import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { apiUrl } from './api-url';

export const inviteRequired = process.env.EXPO_PUBLIC_REQUIRE_BETA_INVITE === '1';
const key = 'cigana.beta.invite';
const listeners = new Set<() => void>();
let invite: string | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function update(value: string | null) {
  invite = value;
  listeners.forEach((listener) => listener());
}

export function useBetaInvite() {
  return useSyncExternalStore(subscribe, () => invite, () => null);
}

export async function restoreBetaInvite() {
  if (!inviteRequired) return;
  update(Platform.OS === 'web' ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key));
}

async function storeInvite(value: string) {
  if (Platform.OS === 'web') await AsyncStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
  update(value);
}

export async function submitBetaInvite(value: string) {
  const code = value.trim().toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(code)) return false;
  const response = await fetch(apiUrl('/api/beta/access'), { headers: { 'X-Beta-Invite': code } });
  if (response.status === 403) return false;
  if (response.status !== 204) throw new Error('Beta access unavailable.');
  await storeInvite(code);
  return true;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const current = invite;
  if (inviteRequired && current) headers.set('X-Beta-Invite', current);
  const response = await fetch(apiUrl(path), { ...options, headers });
  if (inviteRequired && current && response.status === 403 && current === invite) {
    const problem = await response.clone().json().catch(() => undefined);
    if (problem?.error === 'beta_invite_required' && current === invite) {
      update(null);
      if (Platform.OS === 'web') await AsyncStorage.removeItem(key).catch(() => {});
      else await SecureStore.deleteItemAsync(key).catch(() => {});
    }
  }
  return response;
}
