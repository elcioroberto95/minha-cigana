import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { LanguagePicker } from '../../components/LanguagePicker';
import { withIdentityScope } from '../../lib/identity-scope';
import { useSignedIn } from '../../lib/session-token';
import { login, logout, register } from './auth-api';
import { deleteCheckIns, getMemory, getProfile, saveProfile, setMemory, sexes, type Profile } from './profile-api';

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
    <LanguagePicker />
    <Button label={t('voice')} secondary onPress={() => router.push('/perfil/voz')} />
    <Button label={t('privacy')} secondary onPress={() => router.push('/perfil/privacidade')} />
  </Screen>;
}

export const ProfileScreen = withIdentityScope(ProfileScreenContent);

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

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
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
      else router.dismissTo('/perfil');
    } catch {
      setError('authUnavailable');
    } finally {
      setSaving(false);
    }
  }

  return <Screen backTo="/perfil">
    <Title>{t('signIn')}</Title>
    <Panel>
      <EmailField value={email} onChangeText={setEmail} editable={!saving} />
      <Field label={t('password')} value={password} maxLength={128} autoComplete="current-password"
        secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!saving}
        onChangeText={setPassword} onSubmitEditing={() => void submit()} />
    </Panel>
    {error && <Copy>{t(error)}</Copy>}
    <Button label={t(saving ? 'signingIn' : 'signIn')}
      disabled={saving || !email.trim() || !password} onPress={() => void submit()} />
    <Button label={t('signUp')} secondary onPress={() => router.replace('/conta/criar')} />
  </Screen>;
}

function EmailField({ value, onChangeText, editable }: { value: string; onChangeText: (value: string) => void; editable: boolean }) {
  const { t } = useTranslation();
  return <Field label={t('email')} value={value} maxLength={254} keyboardType="email-address"
    autoComplete="email" autoCapitalize="none" autoCorrect={false} editable={editable} onChangeText={onChangeText} />;
}

const emptyProfile: Profile = { name: '', email: '', sex: null };

function ProfileForm({ editing }: { editing: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const signedIn = useSignedIn();
  const [profile, setProfile] = useState(emptyProfile);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'loadError'>('loading');
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Awaited<ReturnType<typeof register>> | 'invalidProfile' | 'profileSaveError'>();

  useEffect(() => {
    const controller = new AbortController();
    void getProfile(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result) setProfile(result);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus(editing ? 'loadError' : 'ready'); });
    return () => controller.abort();
  }, [editing, revision]);

  const incomplete = !profile.name.trim() || !profile.email.trim() || (!editing && Array.from(password).length < 15);

  async function submit() {
    if (saving || incomplete) return;
    setSaving(true);
    setError(undefined);
    try {
      const problem = editing
        ? (await saveProfile(profile) ? undefined : 'invalidProfile')
        : await register(profile, password);
      if (problem) setError(problem);
      else router.dismissTo('/perfil');
    } catch {
      setError('profileSaveError');
    } finally {
      setSaving(false);
    }
  }

  return <Screen backTo="/perfil">
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
        <EmailField value={profile.email} editable={!saving && (!editing || !signedIn)}
          onChangeText={(email) => setProfile({ ...profile, email })} />
        {!editing && <>
          <Field label={t('password')} value={password} maxLength={128} autoComplete="new-password"
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
      {!editing && <Button label={t('signIn')} secondary onPress={() => router.replace('/conta/entrar')} />}
    </>}
  </Screen>;
}

const EditProfileForm = withIdentityScope(ProfileForm);

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

function PrivacyScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void getMemory(controller.signal).then((result) => {
      if (!controller.signal.aborted) setEnabled(result);
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
