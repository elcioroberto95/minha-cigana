import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';
import { enUS, ptBR } from './messages';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ptBR };
  }
}

export type AppLocale = 'pt-BR' | 'en-US';
export type LocalePreference = AppLocale | 'device';

const defaultLocale = 'pt-BR';
const storageKey = 'cigana:locale';
const localeByLanguage: Partial<Record<string, AppLocale>> = { pt: 'pt-BR', en: 'en-US' };

export const appI18n = createInstance();

export async function readLocalePreference(): Promise<LocalePreference> {
  const saved = await AsyncStorage.getItem(storageKey).catch(() => null);
  return saved === 'pt-BR' || saved === 'en-US' ? saved : 'device';
}

function deviceLocale(): AppLocale {
  const languages = Platform.OS === 'web' && typeof window !== 'undefined'
    ? (navigator.languages.length ? navigator.languages : [navigator.language])
    : getLocales().map(({ languageCode, languageTag }) => languageCode ?? languageTag);
  for (const language of languages) {
    const locale = localeByLanguage[language.split('-')[0].toLowerCase()];
    if (locale) return locale;
  }
  return defaultLocale;
}

async function initialLocale() {
  const preference = await readLocalePreference();
  return preference === 'device' ? deviceLocale() : preference;
}

let initialization: Promise<unknown> | undefined;

export function initializeLocalization() {
  initialization ??= initialLocale().then((locale) => appI18n.use(initReactI18next).init({
    lng: locale,
    supportedLngs: ['pt-BR', 'en-US'],
    fallbackLng: defaultLocale,
    load: 'currentOnly',
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
    },
    interpolation: { escapeValue: false },
  }));
  return initialization;
}

export async function saveLocale(preference: LocalePreference) {
  if (preference === 'device') await AsyncStorage.removeItem(storageKey);
  else await AsyncStorage.setItem(storageKey, preference);
  await appI18n.changeLanguage(preference === 'device' ? deviceLocale() : preference);
}
