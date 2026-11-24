import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Button, Copy, Field, Title, colors } from '../../components/ui';
import { submitBetaInvite } from '../../lib/beta-access';

export function BetaAccess() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<'betaInvalid' | 'betaUnavailable'>();

  async function enter() {
    setPending(true);
    setFailure(undefined);
    try {
      if (!await submitBetaInvite(code)) setFailure('betaInvalid');
    } catch {
      setFailure('betaUnavailable');
    } finally {
      setPending(false);
    }
  }

  return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background, padding: 24 }}>
    <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: 14 }}>
      <LanguagePicker />
      <Title>{t('betaAccessTitle')}</Title>
      <Copy>{t('betaAccessIntro')}</Copy>
      <Field label={t('betaInviteCode')} value={code} onChangeText={setCode}
        autoCapitalize="none" autoCorrect={false} secureTextEntry editable={!pending} />
      {failure && <View accessibilityLiveRegion="polite"><Copy>{t(failure)}</Copy></View>}
      <Button label={t('continue')} disabled={!code.trim() || pending} onPress={() => void enter()} />
    </View>
  </View>;
}
