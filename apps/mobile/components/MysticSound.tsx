import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './ui';

const ambience = require('../assets/mystic-ambience.wav');
const cues = {
  shuffle: require('../assets/cards-shuffle.wav'),
  select: require('../assets/cards-select.wav'),
  reveal: require('../assets/cards-reveal.wav'),
};
type CardCue = keyof typeof cues;
const SoundContext = createContext<{ enabled: boolean; toggle: () => void; playCue: (cue: CardCue) => void }>({
  enabled: false, toggle: () => {}, playCue: () => {},
});

export function useCardSound() {
  return useContext(SoundContext).playCue;
}

export function MysticSoundProvider({ children }: { children: ReactNode }) {
  const players = useRef<{ ambient: AudioPlayer; effects: Record<CardCue, AudioPlayer> } | null>(null);
  const soundOn = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const track = createAudioPlayer(ambience);
    track.loop = true;
    track.volume = 0.65;
    const effects = {
      shuffle: createAudioPlayer(cues.shuffle),
      select: createAudioPlayer(cues.select),
      reveal: createAudioPlayer(cues.reveal),
    };
    players.current = { ambient: track, effects };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && soundOn.current) track.play();
      if (state !== 'active') {
        track.pause();
        Object.values(effects).forEach((cue) => cue.pause());
      }
    });
    return () => {
      subscription.remove();
      players.current = null;
      track.remove();
      Object.values(effects).forEach((cue) => cue.remove());
    };
  }, []);

  const playCue = useCallback((cue: CardCue) => {
    const effect = players.current?.effects[cue];
    if (!soundOn.current || !effect || AppState.currentState === 'background') return;
    if (effect.currentTime === 0) effect.play();
    else void effect.seekTo(0).then(() => {
      if (soundOn.current && players.current?.effects[cue] === effect && AppState.currentState !== 'background') effect.play();
    }).catch(() => {});
  }, []);

  function toggle() {
    if (!players.current) return;
    const { ambient, effects } = players.current;
    soundOn.current = !soundOn.current;
    if (soundOn.current) ambient.play();
    else {
      ambient.pause();
      Object.values(effects).forEach((cue) => cue.pause());
    }
    setEnabled(soundOn.current);
  }

  return <SoundContext.Provider value={{ enabled, toggle, playCue }}>{children}</SoundContext.Provider>;
}

export function MysticSoundToggle() {
  const { enabled, toggle } = useContext(SoundContext);
  const { t } = useTranslation();
  return <Pressable accessibilityRole="switch" accessibilityLabel={t('mysticSound')}
    aria-checked={enabled} onPress={toggle}
    style={({ pressed }) => [styles.button, enabled && styles.active, pressed && styles.pressed]}>
    <Text aria-hidden style={styles.icon}>{enabled ? '♫' : '♪'}</Text>
    <Text style={styles.label}>{t(enabled ? 'mysticSoundOn' : 'mysticSoundOff')}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  active: { borderColor: colors.gold },
  pressed: { opacity: 0.7 },
  icon: { color: colors.gold, fontSize: 17 },
  label: { color: colors.cream, fontSize: 12, fontFamily: 'DMSans_600SemiBold' },
});
