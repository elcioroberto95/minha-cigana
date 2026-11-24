import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytesAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const key = 'cigana.history.visitor';
let provisioning: Promise<string> | undefined;

export function getVisitorToken() {
  return Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

async function createVisitorToken() {
  const existing = await getVisitorToken();
  if (existing) return existing;
  const bytes = await getRandomBytesAsync(32);
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (Platform.OS === 'web') await AsyncStorage.setItem(key, token);
  else await SecureStore.setItemAsync(key, token);
  return token;
}

export function getOrCreateVisitorToken() {
  if (!provisioning) {
    const locks = Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.locks : undefined;
    const creation = locks ? locks.request(key, createVisitorToken) : createVisitorToken();
    provisioning = creation.finally(() => { provisioning = undefined; });
  }
  return provisioning;
}

export function removeVisitorToken(expected: string) {
  async function remove() {
    if (await getVisitorToken() !== expected) return false;
    if (Platform.OS === 'web') await AsyncStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
    return true;
  }
  const locks = Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.locks : undefined;
  return locks ? locks.request(key, remove) : remove();
}
