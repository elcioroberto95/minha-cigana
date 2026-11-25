import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Image, Platform, StyleSheet, View } from 'react-native';
import { useCardSound } from '../../components/MysticSound';
import { RitualLoader } from '../../components/RitualLoader';
import { colors } from '../../components/ui';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { cardBack } from './card-art';

const stack = [-2, -1, 0, 1, 2];
const beats = [0, 0.26, 0.53, 0.78, 1];

export function ShuffleDeck({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const playCue = useCardSound();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced === null) return;
    if (reduced) { onDone(); return; }

    playCue('shuffle');
    const useNativeDriver = Platform.OS !== 'web';
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 940, easing: Easing.inOut(Easing.quad), useNativeDriver }),
      Animated.delay(150),
    ]);
    animation.start(({ finished }) => { if (finished) onDone(); });
    return () => animation.stop();
  }, [onDone, playCue, progress, reduced]);

  return <View style={styles.ritual}>
    <View style={styles.table} aria-hidden>
      {stack.map((card) => {
        const hand = card % 2 === 0 ? -1 : 1;
        const x = progress.interpolate({ inputRange: beats, outputRange: [card * 3, hand * 61 + card * 4, -hand * 40, card * 12, card * 3] });
        const y = progress.interpolate({ inputRange: beats, outputRange: [card * 2, -Math.abs(card) * 4, hand * 19, -10, card * 2] });
        const angle = progress.interpolate({ inputRange: beats,
          outputRange: [card * 2, hand * 23 + card * 4, -hand * 15, card * 12, card * 2].map((value) => `${value}deg`) });
        return <Animated.View key={card} style={[styles.card, { transform: [{ translateX: x }, { translateY: y }, { rotate: angle }] }]}>
          <Image source={cardBack} style={styles.image} resizeMode="cover" />
        </Animated.View>;
      })}
    </View>
    <RitualLoader mode="cards" label={t('deckShuffling')} />
  </View>;
}

const styles = StyleSheet.create({
  ritual: { gap: 12 },
  table: { height: 164, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { position: 'absolute', width: 82, height: 120, borderRadius: 8, overflow: 'hidden',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold },
  image: { width: '100%', height: '100%' },
});
