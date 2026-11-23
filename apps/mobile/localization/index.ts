import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enUS, ptBR } from './messages';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ptBR };
  }
}

export type AppLocale = 'pt-BR' | 'en-US';

const defaultLocale = 'pt-BR';
const storageKey = 'cigana:locale';
const localeByLanguage: Partial<Record<string, AppLocale>> = { pt: 'pt-BR', en: 'en-US' };

export const appI18n = createInstance();

async function initialLocale(): Promise<AppLocale> {
  const saved = await AsyncStorage.getItem(storageKey).catch(() => null);
  if (saved === 'pt-BR' || saved === 'en-US') return saved;

  for (const { languageCode } of getLocales()) {
    const locale = languageCode && localeByLanguage[languageCode];
    if (locale) return locale;
  }
  return defaultLocale;
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

export async function saveLocale(locale: AppLocale) {
  await AsyncStorage.setItem(storageKey, locale);
  await appI18n.changeLanguage(locale);
}
