import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, colors, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { LanguagePicker } from '../../components/LanguagePicker';
import { MysticSoundToggle } from '../../components/MysticSound';
import { withIdentityScope } from '../../lib/identity-scope';
import { useSignedIn } from '../../lib/session-token';
import { useSpeechPlayback } from '../chat/speech';
import { login, logout, nextAccountStep, register } from './auth-api';
import { deleteCheckIns, getLearning, getMemory, getProfile, saveProfile, setLearning, setMemory, sexes,
  type LearningPreference, type Profile } from './profile-api';

function ProfileScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const signedIn = useSignedIn();
  const focused = useIsFocused();
  const [profile, setProfile] = useState<Profile | null>();
  const [failed, setFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!focused) return;
    const controller = new AbortController();
    void getProfile(controller.signal).then((result) => {
      if (!controller.signal.aborted) {
        setProfile(result);
        setFailed(false);
      }
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [focused, revision]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await logout();
    } catch {
      setSignOutFailed(true);
      setSigningOut(false);
    }
  }

  return <Screen back={false}>
    <Title>{t('profile')}</Title>
    <Panel>
      {failed ? <>
        <Copy>{t('profileLoadError')}</Copy>
        <Button label={t('tryAgain')} secondary onPress={() => setRevision((value) => value + 1)} />
      </> : profile === undefined ? <Copy>{t('profileLoading')}</Copy> : profile ? <>
        <Copy emphasis>{profile.name}</Copy>
        <Copy>{profile.email}</Copy>
        <Button label={t('editProfile')} secondary onPress={() => router.push('/perfil/editar')} />
      </> : <Copy emphasis>{t('guest')}</Copy>}
      {signedIn ? <>
        <Button label={t('signOut')} secondary disabled={signingOut} onPress={() => void signOut()} />
        {signOutFailed && <Copy>{t('signOutFailed')}</Copy>}
      </> : <>
        <Button label={t('signIn')} onPress={() => router.push('/conta/entrar')} />
        <Button label={t('signUp')} secondary onPress={() => router.push('/conta/criar')} />
      </>}
    </Panel>
    <Button label={t('settings')} secondary onPress={() => router.push('/perfil/configuracoes')} />
    <Button label={t('voice')} secondary onPress={() => router.push('/perfil/voz')} />
    <Button label={t('privacy')} secondary onPress={() => router.push('/perfil/privacidade')} />
  </Screen>;
}

export const ProfileScreen = withIdentityScope(ProfileScreenContent);

export function SettingsScreen() {
  const { t } = useTranslation();
  return <Screen backTo="/perfil">
    <Title>{t('settings')}</Title>
    <Panel><LanguagePicker /></Panel>
    <Panel><MysticSoundToggle /></Panel>
  </Screen>;
}

export function AccountForm({ mode }: { mode: 'signUp' | 'edit' | 'signIn' | 'recover' }) {
  const { t } = useTranslation();
  const router = useRouter();
  const signedIn = useSignedIn();
  if (mode === 'edit') return <EditProfileForm editing />;
  if (mode === 'recover') return <Screen backTo="/perfil">
    <Title>{t('recover')}</Title>
    <Copy>{t('recoveryUnavailable')}</Copy>
    <Button label={t('signIn')} onPress={() => router.dismissTo('/conta/entrar')} />
  </Screen>;
  if (signedIn) return <Screen backTo="/perfil">
    <Title>{t('profile')}</Title>
    <Button label={t('profile')} onPress={() => router.dismissTo('/perfil')} />
  </Screen>;
  if (mode === 'signIn') return <LoginForm />;
  return <ProfileForm editing={false} />;
}

export function AccountEntry() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<'authInvalid' | 'authRateLimited' | 'authUnavailable'>();
  const lookup = useRef<AbortController | null>(null);
  useEffect(() => () => lookup.current?.abort(), []);

  async function continueWithEmail() {
    if (lookup.current || !email.trim()) return;
    const request = new AbortController();
    lookup.current = request;
    setChecking(true);
    setError(undefined);
    try {
      const next = await nextAccountStep(email.trim(), request.signal);
      if (request.signal.aborted) return;
      if (next === 'login' || next === 'register') setStep(next);
      else setError(next);
    } catch {
      if (!request.signal.aborted) setError('authUnavailable');
    } finally {
      lookup.current = null;
      if (!request.signal.aborted) setChecking(false);
    }
  }

  const changeEmail = () => setStep('email');
  if (step === 'login') return <LoginForm initialEmail={email.trim()} onChangeEmail={changeEmail} />;
  if (step === 'register') return <ProfileForm editing={false} initialEmail={email.trim()} onSignIn={changeEmail} />;

  return <Screen back={false}>
    <View style={entryStyles.brand}>
      <Text aria-hidden style={entryStyles.star}>✦</Text>
      <Text style={entryStyles.brandText}>Cigana do Destino</Text>
    </View>
    <View style={entryStyles.cover}>
      <Image source={require('../../assets/personagem.png')} style={entryStyles.portrait} resizeMode="cover" accessibilityLabel={t('portrait')} />
      <View style={entryStyles.frame} aria-hidden pointerEvents="none" />
    </View>
    <Title>{t('accountWelcome')}</Title>
    <Copy>{t('accountEmailIntro')}</Copy>
    <Panel>
      <EmailField value={email} onChangeText={(value) => { setEmail(value); setError(undefined); }} editable={!checking}
        onSubmitEditing={() => void continueWithEmail()} />
      {error && <View role="status" accessibilityLiveRegion="polite"><Copy>{t(error)}</Copy></View>}
      <Button label={t(checking ? 'accountChecking' : 'accountContinue')} disabled={checking || !email.trim()}
        onPress={() => void continueWithEmail()} />
    </Panel>
  </Screen>;
}

const entryStyles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 8, minHeight: 42 },
  star: { color: colors.gold, fontSize: 24 },
  brandText: { color: colors.cream, fontSize: 16, fontFamily: 'Cinzel_600SemiBold' },
  cover: { aspectRatio: 1.48, borderTopLeftRadius: 46, borderTopRightRadius: 46, borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20, borderWidth: 1, borderColor: colors.gold, overflow: 'hidden', backgroundColor: colors.surface },
  portrait: { width: '100%', height: '100%' },
  frame: { ...StyleSheet.absoluteFill, margin: 6, borderWidth: 1, borderColor: '#D8B66A80',
    borderTopLeftRadius: 39, borderTopRightRadius: 39, borderBottomLeftRadius: 13, borderBottomRightRadius: 13 },
});

function LoginForm({ initialEmail = '', onChangeEmail }: { initialEmail?: string; onChangeEmail?: () => void } = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Awaited<ReturnType<typeof login>> | 'authUnavailable'>();

  async function submit() {
    if (saving || !email.trim() || !password) return;
    setSaving(true);
    setError(undefined);
    try {
      const problem = await login({ email, password });
      if (problem) setError(problem);
      else if (!onChangeEmail) router.dismissTo('/perfil');
    } catch {
      setError('authUnavailable');
    } finally {
      setSaving(false);
    }
  }

  return <Screen back={!onChangeEmail} backTo="/perfil">
    <Title>{t('signIn')}</Title>
    <Panel>
      {onChangeEmail ? <Copy>{email}</Copy> : <EmailField value={email} onChangeText={setEmail} editable={!saving} />}
      <Field label={t('password')} value={password} maxLength={128} autoComplete="current-password"
        secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!saving}
        onChangeText={setPassword} onSubmitEditing={() => void submit()} />
    </Panel>
    {error && <Copy>{t(error)}</Copy>}
    <Button label={t(saving ? 'signingIn' : 'signIn')}
      disabled={saving || !email.trim() || !password} onPress={() => void submit()} />
    <Button label={t(onChangeEmail ? 'accountChangeEmail' : 'signUp')} disabled={saving} secondary
      onPress={onChangeEmail ?? (() => router.replace('/conta/criar'))} />
  </Screen>;
}

function EmailField({ value, onChangeText, editable, onSubmitEditing }: {
  value: string; onChangeText: (value: string) => void; editable: boolean; onSubmitEditing?: () => void;
}) {
  const { t } = useTranslation();
  return <Field label={t('email')} value={value} maxLength={254} keyboardType="email-address"
    autoComplete="email" autoCapitalize="none" autoCorrect={false} editable={editable} onChangeText={onChangeText}
    onSubmitEditing={onSubmitEditing} />;
}

const emptyProfile: Profile = { name: '', email: '', sex: null };
const registrationPasswordLength = 8;

function ProfileForm({ editing, initialEmail = '', onSignIn }: { editing: boolean; initialEmail?: string; onSignIn?: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const signedIn = useSignedIn();
  const [profile, setProfile] = useState({ ...emptyProfile, email: initialEmail });
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'loadError'>(onSignIn ? 'ready' : 'loading');
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Awaited<ReturnType<typeof register>> | 'invalidProfile' | 'profileSaveError'>();

  useEffect(() => {
    if (onSignIn) return;
    const controller = new AbortController();
    void getProfile(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result) setProfile(result);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus(editing ? 'loadError' : 'ready'); });
    return () => controller.abort();
  }, [editing, onSignIn, revision]);

  const incomplete = !profile.name.trim() || !profile.email.trim()
    || (!editing && Array.from(password).length !== registrationPasswordLength);

  async function submit() {
    if (saving || incomplete) return;
    setSaving(true);
    setError(undefined);
    try {
      const problem = editing
        ? (await saveProfile(profile) ? undefined : 'invalidProfile')
        : await register(profile, password);
      if (problem) setError(problem);
      else if (!onSignIn) router.dismissTo('/perfil');
    } catch {
      setError('profileSaveError');
    } finally {
      setSaving(false);
    }
  }

  return <Screen back={!onSignIn} backTo="/perfil">
    <Title>{t(editing ? 'editProfile' : 'signUp')}</Title>
    {!editing && <Copy>{t('registrationIntro')}</Copy>}
    {status === 'loading' && <Copy>{t('profileLoading')}</Copy>}
    {status === 'loadError' && <>
      <Copy>{t('profileLoadError')}</Copy>
      <Button label={t('tryAgain')} secondary onPress={() => {
        setStatus('loading');
        setRevision((value) => value + 1);
      }} />
    </>}
    {status === 'ready' && <>
      <Panel>
        <Field label={t('preferredName')} value={profile.name} maxLength={80} autoComplete="name"
          editable={!saving} onChangeText={(name) => setProfile({ ...profile, name })} />
        {onSignIn ? <Copy>{profile.email}</Copy> : <EmailField value={profile.email} editable={!saving && (!editing || !signedIn)}
          onChangeText={(email) => setProfile({ ...profile, email })} />}
        {!editing && <>
          <Field label={t('password')} value={password} maxLength={registrationPasswordLength * 2} autoComplete="new-password"
            secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!saving} onChangeText={setPassword} />
          <Copy>{t('passwordHint')}</Copy>
        </>}
        <Copy emphasis>{t('optionalSex')}</Copy>
        {sexes.map((sex) => <Button key={sex} label={t(sex)} secondary disabled={saving}
          selected={profile.sex === sex} onPress={() => setProfile({ ...profile, sex })} />)}
        <Button label={t('preferNotToSay')} secondary disabled={saving}
          selected={profile.sex === null} onPress={() => setProfile({ ...profile, sex: null })} />
      </Panel>
      {error && <Copy>{t(error)}</Copy>}
      <Button label={t(saving ? 'profileSaving' : editing ? 'saveProfile' : 'signUp')}
        disabled={saving || incomplete} onPress={() => void submit()} />
      {!editing && <Button label={t(onSignIn ? 'accountChangeEmail' : 'signIn')} disabled={saving} secondary
        onPress={onSignIn ?? (() => router.replace('/conta/entrar'))} />}
    </>}
  </Screen>;
}

const EditProfileForm = withIdentityScope(ProfileForm);

export function VoiceScreen() {
  const { t, i18n } = useTranslation();
  const voice = useSpeechPlayback(i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR');
  return <Screen backTo="/perfil">
    <Title>{t('voice')}</Title>
    <Panel>
      <Copy>{t('voiceSampleLine')}</Copy>
      <Button label={t(voice.preparing ? 'speechPreparing' : voice.speaking ? 'stopSpeech' : 'voiceSample')} secondary
        onPress={() => voice.speaking ? voice.stop() : voice.speak(t('voiceSampleLine'))} />
      {voice.speechFailed && <Copy>{t('speechPlaybackError')}</Copy>}
    </Panel>
  </Screen>;
}

function PrivacyScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean>();
  const [learning, setLearningState] = useState<LearningPreference>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void getMemory(controller.signal).then((result) => {
      if (!controller.signal.aborted) setEnabled(result);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    void getLearning(controller.signal).then((result) => {
      if (!controller.signal.aborted) setLearningState(result);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [revision]);

  async function changeMemory() {
    if (saving || enabled === undefined) return;
    setSaving(true);
    setFailed(false);
    try {
      await setMemory(!enabled);
      setEnabled(!enabled);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  async function changeLearning() {
    if (saving || !learning) return;
    setSaving(true);
    setFailed(false);
    try {
      await setLearning(!learning.enabled);
      setLearningState({ enabled: !learning.enabled, items: [] });
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

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
      {enabled === undefined ? <Copy>{t(failed ? 'profileLoadError' : 'profileLoading')}</Copy> : <>
        <Copy>{t(enabled ? 'memoryOn' : 'memoryOff')}</Copy>
        <Button label={t(enabled ? 'disableMemory' : 'enableMemory')} secondary disabled={saving}
          onPress={() => void changeMemory()} />
        {failed && <Copy>{t('profileSaveError')}</Copy>}
      </>}
      {failed && enabled === undefined && <Button label={t('tryAgain')} secondary onPress={() => {
        setFailed(false);
        setRevision((value) => value + 1);
      }} />}
    </Panel>
    <Panel>
      <Copy emphasis>{t('profileLearning')}</Copy>
      <Copy>{t('profileLearningIntro')}</Copy>
      {learning && <>
        {learning.items.map(({ kind, value }) => <Copy key={kind}>
          {t(`learned_${kind}`) + ' · ' + (kind === 'occupation' ? value : t(`learned_${value}`))}
        </Copy>)}
        <Button label={t(learning.enabled ? 'disableLearning' : 'enableLearning')} secondary disabled={saving}
          onPress={() => void changeLearning()} />
      </>}
      {failed && !learning && <Button label={t('tryAgain')} secondary onPress={() => {
        setFailed(false);
        setRevision((value) => value + 1);
      }} />}
    </Panel>
    <Button label={t('manageData')} onPress={() => router.push('/perfil/privacidade/dados')} />
  </Screen>;
}

function DataScreenContent() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'confirming' | 'deleting' | 'failed' | 'deleted'>('idle');

  async function clear() {
    setStatus('deleting');
    try {
      await deleteCheckIns();
      setStatus('deleted');
    } catch {
      setStatus('failed');
    }
  }

  const confirming = status === 'confirming' || status === 'deleting' || status === 'failed';
  return <Screen backTo="/perfil/privacidade">
    <Title>{t('manageData')}</Title>
    <Panel>
      {confirming ? <>
        <Copy>{t('clearCheckInsConfirm')}</Copy>
        <Button label={t('clearCheckIns')} disabled={status === 'deleting'} onPress={() => void clear()} />
        <Button label={t('cancel')} disabled={status === 'deleting'} secondary onPress={() => setStatus('idle')} />
        {status === 'failed' && <Copy>{t('clearCheckInsError')}</Copy>}
      </> : <>
        <Button label={t('clearCheckIns')} secondary onPress={() => setStatus('confirming')} />
        {status === 'deleted' && <Copy>{t('checkInsCleared')}</Copy>}
      </>}
    </Panel>
  </Screen>;
}

export const PrivacyScreen = withIdentityScope(PrivacyScreenContent);
export const DataScreen = withIdentityScope(DataScreenContent);
