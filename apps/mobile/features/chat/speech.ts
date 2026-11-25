import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { randomUUID } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getIdentityToken, identityFetch } from '../../lib/session-token';
import type { AppLocale } from '../../localization';

type Playback = { controller: AbortController; dispose?: () => void };

export function useSpeechPlayback(locale: AppLocale) {
  const [phase, setPhase] = useState<'idle' | 'preparing' | 'playing'>('idle');
  const [speechFailed, setSpeechFailed] = useState(false);
  const active = useRef<Playback | null>(null);
  const canPlay = useRef(false);
  const focused = useIsFocused();

  const stop = useCallback(() => {
    const previous = active.current;
    active.current = null;
    previous?.controller.abort();
    previous?.dispose?.();
    setPhase('idle');
  }, []);

  useEffect(() => {
    if (!focused) return;
    canPlay.current = true;
    return () => { canPlay.current = false; stop(); };
  }, [focused, stop]);

  const speak = useCallback((text: string, onStart?: () => void) => {
    if (!canPlay.current) return;
    stop();
    const playback: Playback = { controller: new AbortController() };
    active.current = playback;
    setSpeechFailed(false);
    setPhase('preparing');

    function fail() {
      if (active.current !== playback) return;
      stop();
      setSpeechFailed(true);
    }

    void (async () => {
      const signal = playback.controller.signal;
      const token = await getIdentityToken();
      if (!token) throw new Error('Missing session');
      const response = await identityFetch('/api/speech/synthesize', token, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, locale }), signal,
      });
      if (!response.ok) throw new Error('Speech unavailable');
      const audio = await response.arrayBuffer();
      await setAudioModeAsync({ playsInSilentMode: true });
      if (signal.aborted) return;

      const clip = createClip(audio);
      playback.dispose = clip.dispose;
      const player = createAudioPlayer(clip.uri, { updateInterval: 150 });
      const waiting = setTimeout(fail, 4500);
      let started = false;
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (active.current !== playback) return;
        if (status.playing && !started) {
          started = true;
          clearTimeout(waiting);
          setPhase('playing');
          onStart?.();
        }
        if (status.didJustFinish) stop();
      });
      playback.dispose = () => {
        clearTimeout(waiting);
        subscription.remove();
        try { player.remove(); } finally { clip.dispose(); }
      };
      player.play();
    })().catch(fail);
  }, [locale, stop]);

  return { speaking: focused && phase !== 'idle', preparing: focused && phase === 'preparing', speechFailed, speak, stop };
}

function createClip(audio: ArrayBuffer) {
  if (Platform.OS === 'web') {
    const uri = URL.createObjectURL(new Blob([audio], { type: 'audio/mpeg' }));
    return { uri, dispose: () => URL.revokeObjectURL(uri) };
  }
  const file = new File(Paths.cache, `esmeralda-${randomUUID()}.mp3`);
  const dispose = () => { if (file.exists) file.delete(); };
  try {
    file.create();
    file.write(new Uint8Array(audio));
    return { uri: file.uri, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
