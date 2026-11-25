import { useEffect, useState } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../components/ui';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { cardBack } from './card-art';

export function CardBack({ label, selected = false, disabled = false, onPress }: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const reduced = useReducedMotion();
  const [lift] = useState(() => new Animated.Value(0));
  const selectable = !!onPress;
  useEffect(() => {
    if (!selectable || reduced !== false) {
      lift.setValue(0);
      return;
    }
    const animation = Animated.spring(lift, {
      toValue: selected ? -5 : 0, stiffness: 200, damping: 17, mass: 0.7, useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [lift, reduced, selectable, selected]);

  const face = <View style={styles.frame}>
    <Image source={cardBack} style={styles.image} resizeMode="cover" accessible={false} />
    {onPress && <Text aria-hidden style={styles.label}>{label}</Text>}
  </View>;

  if (!onPress) return <View accessible={false} aria-hidden style={[styles.card, styles.display]}>{face}</View>;

  return <Animated.View style={{ transform: [{ translateY: lift }] }}>
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      aria-pressed={selected} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.card, styles.selectable, selected && styles.selected, (pressed || disabled) && styles.faded]}>
      {face}
    </Pressable>
  </Animated.View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 11, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  selectable: { aspectRatio: 0.8, maxHeight: 145 },
  display: { width: '56%', maxWidth: 214, aspectRatio: 0.73, alignSelf: 'center', borderColor: colors.gold },
  frame: { flex: 1, justifyContent: 'flex-end', alignItems: 'stretch' },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  label: { color: colors.cream, backgroundColor: '#150c23e8', padding: 4, fontFamily: 'DMSans_600SemiBold', fontSize: 12, textAlign: 'center' },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  faded: { opacity: 0.55 },
});
