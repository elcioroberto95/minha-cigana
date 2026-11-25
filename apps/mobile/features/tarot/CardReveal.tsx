import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text } from 'react-native';
import { colors } from '../../components/ui';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { cardBack, getCardArt } from './card-art';

export function CardReveal({ id, inverted = false, animate = true, index = 0, large = false }: {
  id: string; inverted?: boolean; animate?: boolean; index?: number; large?: boolean;
}) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const { source, rank } = getCardArt(id);
  const shouldAnimate = animate && reduced === false;
  const checkingPreference = animate && reduced === null;

  useEffect(() => {
    if (!shouldAnimate) return;
    progress.setValue(0);
    const flip = Animated.timing(progress, {
      toValue: 1, duration: 660, delay: Math.min(index, 5) * 95,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    });
    flip.start();
    return () => flip.stop();
  }, [id, index, progress, shouldAnimate]);

  const backRotation = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotation = progress.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });
  const backOpacity = progress.interpolate({ inputRange: [0, 0.495, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frontOpacity = progress.interpolate({ inputRange: [0, 0.5, 0.505, 1], outputRange: [0, 0, 1, 1] });
  const lift = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -12, 0] });

  return <Animated.View accessible={false} aria-hidden style={[styles.card, large && styles.large,
    shouldAnimate && { transform: [{ translateY: lift }] }]}>
    {(shouldAnimate || checkingPreference) && <Animated.View style={[styles.face, shouldAnimate && {
      opacity: backOpacity, transform: [{ perspective: 650 }, { rotateY: backRotation }],
    }]}>
      <Image source={cardBack} style={styles.art} resizeMode="stretch" />
    </Animated.View>}
    {!checkingPreference && <Animated.View style={[styles.face, shouldAnimate && {
      opacity: frontOpacity, transform: [{ perspective: 650 }, { rotateY: frontRotation }],
    }]}>
      <Image source={source} style={[styles.art, inverted && styles.inverted]} resizeMode="stretch" />
      {rank && <Text style={styles.rank}>{rank}</Text>}
    </Animated.View>}
  </Animated.View>;
}

const styles = StyleSheet.create({
  card: { alignSelf: 'center', width: '52%', maxWidth: 150, aspectRatio: 0.73 },
  large: { width: '56%', maxWidth: 214 },
  face: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.gold, backfaceVisibility: 'hidden' },
  art: { width: '100%', height: '100%' },
  inverted: { transform: [{ rotate: '180deg' }] },
  rank: { position: 'absolute', alignSelf: 'center', bottom: 8, minWidth: 24, paddingHorizontal: 4, textAlign: 'center',
    backgroundColor: colors.background, borderColor: colors.gold, borderWidth: 1, borderRadius: 12,
    color: colors.cream, fontFamily: 'Cinzel_600SemiBold', fontSize: 14 },
});
