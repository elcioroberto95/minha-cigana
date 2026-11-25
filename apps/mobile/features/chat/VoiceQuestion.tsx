import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { File } from 'expo-file-system';
import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Button, Copy } from '../../components/ui';
import type { AppLocale } from '../../localization';
import { getOrCreateIdentityToken, identityFetch } from '../../lib/session-token';

export function VoiceQuestion({ locale, disabled, onQuestion, onBusyChange }: {
  locale: AppLocale; disabled: boolean; onQuestion: (text: string) => void; onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const focused = useIsFocused();
  const recordingAllowed = useRef(false);
  const [state, setState] = useState<'idle' | 'starting' | 'recording' | 'ready' | 'sending'>('idle');
  const [error, setError] = useState<'voicePermission' | 'voiceRecordError' | 'voiceTranscribeError' | 'voiceUnavailable'>();
  const clip = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef<AbortController | null>(null);
  const finishing = useRef(false);

  useEffect(() => {
    if (!focused) return;
    recordingAllowed.current = true;
    return () => {
      recordingAllowed.current = false;
      request.current?.abort();
      if (timer.current) {
        clearTimeout(timer.current);
        void Promise.resolve().then(() => recorder.stop()).then(() => {
          if (recorder.uri) discardClip(recorder.uri);
        }).catch(() => {});
      }
      timer.current = null;
      if (clip.current) discardClip(clip.current);
      clip.current = null;
      void setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      onBusyChange(false);
      setState('idle');
    };
  }, [focused, onBusyChange, recorder]);

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error('Missing recording');
      if (!recordingAllowed.current) { discardClip(recorder.uri); return; }
      clip.current = recorder.uri;
      setState('ready');
    } catch {
      if (recordingAllowed.current) {
        setError('voiceRecordError');
        setState('idle');
        onBusyChange(false);
      }
    } finally {
      finishing.current = false;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    }
  }

  async function start() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    onBusyChange(true);
    setError(undefined);
    setState('starting');
    try {
      const token = await getOrCreateIdentityToken();
      const response = await identityFetch('/api/speech', token, { signal: controller.signal });
      if (!response.ok || !(await response.json()).transcription) {
        if (!controller.signal.aborted) setError('voiceUnavailable');
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (controller.signal.aborted) return;
      if (!permission.granted) { setError('voicePermission'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      if (controller.signal.aborted) return;
      recorder.record();
      setState('recording');
      timer.current = setTimeout(() => void finish(), 30_000);
      return;
    } catch {
      if (!controller.signal.aborted) setError('voiceRecordError');
    } finally {
      request.current = null;
      if (!controller.signal.aborted && !timer.current) {
        setState('idle');
        onBusyChange(false);
        void setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      }
    }
  }

  function clearRecording() {
    if (clip.current) discardClip(clip.current);
    clip.current = null;
    setState('idle');
    onBusyChange(false);
  }

  async function send() {
    if (!clip.current || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setError(undefined);
    setState('sending');
    try {
      const form = new FormData();
      form.append('locale', locale);
      if (Platform.OS === 'web') {
        const blob = await fetch(clip.current).then((response) => response.blob());
        const mime = blob.type.split(';')[0];
        form.append('audio', new Blob([blob], { type: mime }), mime === 'audio/mp4' ? 'question.m4a' : 'question.webm');
      } else {
        form.append('audio', { uri: clip.current, name: 'question.m4a', type: 'audio/mp4' } as unknown as Blob);
      }
      const token = await getOrCreateIdentityToken();
      const response = await identityFetch('/api/speech/transcribe', token, { method: 'POST', body: form, signal: controller.signal });
      if (!response.ok) throw new Error('Transcription failed');
      const { text } = await response.json();
      if (typeof text !== 'string' || !text.trim()) throw new Error('Missing transcript');
      if (controller.signal.aborted) return;
      clearRecording();
      onQuestion(text);
    } catch {
      if (!controller.signal.aborted) { setError('voiceTranscribeError'); setState('ready'); }
    } finally { request.current = null; }
  }

  return <>
    {state === 'recording' ? <Button label={t('voiceStopRecording')} secondary onPress={() => void finish()} />
      : state === 'ready' || state === 'sending' ? <>
        <Button label={t(state === 'sending' ? 'voiceTranscribing' : 'voiceSend')} disabled={disabled || state === 'sending'} onPress={() => void send()} />
        <Button label={t('voiceDiscard')} secondary disabled={state === 'sending'} onPress={clearRecording} />
      </> : <Button label={t(state === 'starting' ? 'voiceStarting' : 'record')} secondary disabled={disabled || state === 'starting'} onPress={() => void start()} />}
    {error && <Copy>{t(error)}</Copy>}
  </>;
}

function discardClip(uri: string) {
  if (Platform.OS === 'web') {
    if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    return;
  }
  try { new File(uri).delete(); } catch { /* The recording cache may already have been removed. */ }
}
