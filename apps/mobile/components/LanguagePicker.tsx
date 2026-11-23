import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { type AppLocale, saveLocale } from '../localization';
import { Button, Copy } from './ui';

const options = [
  { locale: 'pt-BR', label: 'Português' },
  { locale: 'en-US', label: 'English' },
] as const;

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const savingRef = useRef(false);

  async function select(locale: AppLocale) {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setFailed(false);
    try {
      await saveLocale(locale);
    } catch {
      setFailed(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return <View style={styles.control}>
    <Copy>{t('language')}</Copy>
    <View style={styles.options}>
      {options.map(({ locale, label }) => <View key={locale} style={styles.option}>
        <Button label={label} secondary disabled={saving} selected={i18n.resolvedLanguage === locale}
          onPress={() => void select(locale)} />
      </View>)}
    </View>
    {failed && <View accessibilityLiveRegion="polite"><Copy>{t('languageSaveError')}</Copy></View>}
  </View>;
}

const styles = StyleSheet.create({
  control: { gap: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flex: 1, minWidth: 112 },
});
