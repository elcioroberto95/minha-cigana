import { DMSans_400Regular, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../components/ui';
import { BetaAccess } from '../features/account/BetaAccess';
import { inviteRequired, restoreBetaInvite, useBetaInvite } from '../lib/beta-access';
import { DailyCheckIn } from '../features/account/DailyCheckIn';
import { DraftProvider } from '../features/chat/DraftProvider';
import { restoreSession, watchSessionStorage } from '../lib/session-token';
import { appI18n, initializeLocalization } from '../localization';

export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_600SemiBold, DMSerifText_400Regular });
  const [localized, setLocalized] = useState(false);
  const invite = useBetaInvite();

  useEffect(() => {
    let mounted = true;
    function updateDocumentLocale(locale: string) {
      if (typeof document !== 'undefined') document.documentElement.lang = locale;
    }

    appI18n.on('languageChanged', updateDocumentLocale);
    const stopWatchingSession = watchSessionStorage();
    void Promise.all([initializeLocalization(), restoreSession().catch(() => {}), restoreBetaInvite().catch(() => {})]).then(() => {
      if (!mounted) return;
      updateDocumentLocale(appI18n.language);
      setLocalized(true);
    });

    return () => {
      mounted = false;
      stopWatchingSession?.();
      appI18n.off('languageChanged', updateDocumentLocale);
    };
  }, []);

  if ((!loaded && !error) || !localized) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator color={colors.gold} />
  </View>;

  return <I18nextProvider i18n={appI18n}>
    <StatusBar style="light" />
    {inviteRequired && !invite ? <BetaAccess /> : <>
    <DraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </DraftProvider>
    <DailyCheckIn />
    </>}
  </I18nextProvider>;
}
