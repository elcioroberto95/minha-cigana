import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { LanguagePicker } from '../../components/LanguagePicker';

export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen back={false}>
    <Title>{t('profile')}</Title>
    <Panel>
      <Copy emphasis>{t('guest')}</Copy>
      <Button label={t('signIn')} onPress={() => router.push('/conta/entrar')} />
      <Button label={t('signUp')} secondary onPress={() => router.push('/conta/criar')} />
    </Panel>
    <LanguagePicker />
    <Button label={t('voice')} secondary onPress={() => router.push('/perfil/voz')} />
    <Button label={t('privacy')} secondary onPress={() => router.push('/perfil/privacidade')} />
  </Screen>;
}

const accountTitles = { signIn: 'signIn', signUp: 'signUp', recover: 'recover', edit: 'editProfile' } as const;

export function AccountForm({ mode }: { mode: keyof typeof accountTitles }) {
  const { t } = useTranslation();
  const router = useRouter();

  return <Screen backTo="/perfil">
    <Title>{t(accountTitles[mode])}</Title>
    <Copy>{t('accountUnavailable')}</Copy>
    <Panel>
      {(mode === 'signUp' || mode === 'edit') && <Field label={t('name')} editable={false} />}
      <Field label={t('email')} keyboardType="email-address" editable={false} />
      {(mode === 'signIn' || mode === 'signUp') && <Field label={t('password')} secureTextEntry editable={false} />}
    </Panel>
    <Button label={t(accountTitles[mode])} disabled />
    {mode === 'signIn' && <>
      <Button label={t('recover')} secondary onPress={() => router.push('/conta/recuperar')} />
      <Button label={t('signUp')} secondary onPress={() => router.replace('/conta/criar')} />
    </>}
    {mode === 'signUp' && <Button label={t('signIn')} secondary onPress={() => router.replace('/conta/entrar')} />}
    {mode === 'recover' && <Button label={t('signIn')} secondary onPress={() => router.dismissTo('/conta/entrar')} />}
  </Screen>;
}

export function VoiceScreen() {
  const { t } = useTranslation();
  return <Screen backTo="/perfil">
    <Title>{t('voice')}</Title>
    <Panel>
      <Copy>{t('voiceUnavailable')}</Copy>
      <Button label={t('voiceSample')} secondary disabled />
    </Panel>
  </Screen>;
}

export function PrivacyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen backTo="/perfil">
    <Title>{t('privacy')}</Title>
    <Panel>
      <Copy emphasis>{t('saveHistory')}</Copy>
      <Copy>{t('saveConversationPrivacy')}</Copy>
      <Button label={t('history')} secondary onPress={() => router.navigate('/historico')} />
    </Panel>
    <Panel>
      <Copy emphasis>{t('memory')}</Copy>
      <Copy>{t('memoryIntro')}</Copy>
    </Panel>
    <Copy>{t('accountUnavailable')}</Copy>
    <Button label={t('manageData')} onPress={() => router.push('/perfil/privacidade/dados')} />
  </Screen>;
}

export function DataScreen() {
  const { t } = useTranslation();
  return <Screen backTo="/perfil/privacidade">
    <Title>{t('manageData')}</Title>
    <Copy>{t('accountUnavailable')}</Copy>
    <Panel>
      <Button label={t('clearHistory')} secondary disabled />
      <Button label={t('deleteAccount')} secondary disabled />
    </Panel>
  </Screen>;
}
