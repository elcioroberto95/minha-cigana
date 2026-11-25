import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '../lib/use-reduced-motion';
import { colors, Copy } from './ui';

const messages = {
  consultation: ['ritualStars', 'ritualAura', 'ritualSilence'],
  cards: ['ritualDeck', 'ritualMoon', 'ritualStars'],
  reading: ['ritualSymbols', 'ritualStars', 'ritualMoon'],
} as const;

export function RitualLoader({ label, mode }: { label: string; mode: keyof typeof messages }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [orbit] = useState(() => new Animated.Value(0));
  const phrases = messages[mode];

  useEffect(() => {
    const timer = setInterval(() => setStep((value) => value + 1), 2400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reduced !== false) return;
    const animation = Animated.loop(Animated.timing(orbit, {
      toValue: 1, duration: 3800, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); orbit.setValue(0); };
  }, [orbit, reduced]);

  const rotation = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <View style={styles.loader}>
    <View style={styles.emblem} aria-hidden>
      <Animated.View style={[styles.orbit, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.spark} />
      </Animated.View>
      <Text style={styles.star}>✦</Text>
    </View>
    <View style={styles.words}>
      <View role="status" accessibilityLiveRegion="polite"><Copy emphasis>{label}</Copy></View>
      <Text aria-hidden style={styles.phrase}>{t(phrases[step % phrases.length])}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  loader: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 66, padding: 10,
    borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  emblem: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  orbit: { ...StyleSheet.absoluteFill, borderWidth: 1, borderRadius: 20, borderColor: '#D8B66A80' },
  spark: { position: 'absolute', top: -2, left: 16, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cream },
  star: { color: colors.gold, fontSize: 20 },
  words: { flex: 1, gap: 1 },
  phrase: { color: colors.muted, fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 18 },
});
