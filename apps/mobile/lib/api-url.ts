import { Platform } from 'react-native';

export function apiUrl(path: string) {
  const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  const base = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:3000`;
  return new URL(path, base).toString();
}
