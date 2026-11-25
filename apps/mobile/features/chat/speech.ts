import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from 'expo-router';
import type { AppLocale } from '../../localization';

export function useSpeechPlayback(locale: AppLocale) {
  const [speaking, setSpeaking] = useState(false);
  const [speechFailed, setSpeechFailed] = useState(false);
  const run = useRef(0);
  const canPlay = useRef(false);
  const focused = useIsFocused();

  const stop = useCallback(() => {
    run.current++;
    setSpeaking(false);
    void Speech.stop().catch(() => {});
  }, []);

  useEffect(() => {
    if (!focused) return;
    canPlay.current = true;
    return () => {
      canPlay.current = false;
      stop();
    };
  }, [focused, stop]);

  const speak = useCallback((text: string, onStart?: () => void) => {
    if (!canPlay.current) return;
    const current = ++run.current;
    setSpeechFailed(false);
    setSpeaking(true);

    function failed() {
      if (current !== run.current) return;
      setSpeaking(false);
      setSpeechFailed(true);
    }

    void Speech.stop().then(() => {
      if (current !== run.current) return;
      const chunks: string[] = [];
      let remaining = text.trim();
      while (remaining) {
        const limit = Math.min(440, remaining.length);
        const space = limit < remaining.length ? remaining.lastIndexOf(' ', limit) : limit;
        const end = space > 0 ? space : limit;
        chunks.push(remaining.slice(0, end));
        remaining = remaining.slice(end).trimStart();
      }
      function play(index: number) {
        if (current !== run.current) return;
        if (index === chunks.length) { setSpeaking(false); return; }
        Speech.speak(chunks[index], {
          language: locale, pitch: 0.94, rate: 0.86,
          onStart: index === 0 ? onStart : undefined,
          onDone: () => play(index + 1), onError: failed,
          onStopped: () => { if (current === run.current) setSpeaking(false); },
        });
      }
      play(0);
    }).catch(failed);
  }, [locale]);

  return { speaking: focused && speaking, speechFailed, speak, stop };
}
