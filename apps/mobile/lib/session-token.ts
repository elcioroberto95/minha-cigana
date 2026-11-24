import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { apiFetch } from './api-url';
import { getOrCreateVisitorToken, getVisitorToken, removeVisitorToken } from './visitor-token';

const key = 'cigana.account.session';
const listeners = new Set<() => void>();
let token: string | null = null;
let revision = 0;
let storageTask = Promise.resolve();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function update(next: string | null) {
  if (token === next) return;
  token = next;
  revision++;
  listeners.forEach((listener) => listener());
}

export function useSignedIn() {
  return useSyncExternalStore(subscribe, () => token !== null, () => false);
}

export function useIdentityRevision() {
  return useSyncExternalStore(subscribe, () => revision, () => 0);
}

export async function restoreSession() {
  const stored = Platform.OS === 'web' ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
  update(stored);
}

export function watchSessionStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  function changed(event: StorageEvent) {
    if (event.key === key || event.key === null) void restoreSession().catch(() => {});
  }
  window.addEventListener('storage', changed);
  return () => window.removeEventListener('storage', changed);
}

function persist(next: string | null, expected?: string) {
  const task = storageTask.then(async () => {
    if (expected !== undefined && token !== expected) return;
    if (Platform.OS === 'web') {
      async function writeWeb() {
        const stored = await AsyncStorage.getItem(key);
        if (expected !== undefined && stored !== expected) {
          update(stored);
          return;
        }
        if (next) await AsyncStorage.setItem(key, next);
        else await AsyncStorage.removeItem(key);
        update(next);
      }
      const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
      await (locks ? locks.request(key, writeWeb) : writeWeb());
      return;
    }
    if (next) await SecureStore.setItemAsync(key, next);
    else await SecureStore.deleteItemAsync(key);
    update(next);
  });
  storageTask = task.catch(() => {});
  return task;
}

export function storeSession(next: string) {
  if (!/^a_[a-f0-9]{64}$/.test(next)) throw new Error('Invalid account session');
  return persist(next);
}

export function clearSession(expected: string) {
  return persist(null, expected);
}

export function getAccountToken() {
  return token;
}

export async function getIdentityToken() {
  return token ?? getVisitorToken();
}

export async function getOrCreateIdentityToken() {
  return token ?? getOrCreateVisitorToken();
}

export async function identityFetch(path: string, credential: string | null, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (credential) headers.set('Authorization', 'Bearer ' + credential);
  const response = await apiFetch(path, { ...options, headers });
  if (response.status === 401 && credential && credential === token) {
    await clearSession(credential).catch(() => {});
  } else if (response.status === 401 && credential && !credential.startsWith('a_')) {
    const problem = await response.clone().json().catch(() => undefined);
    if (problem?.error === 'visitor_converted' && await removeVisitorToken(credential) && token === null) {
      revision++;
      listeners.forEach((listener) => listener());
    }
  }
  return response;
}
