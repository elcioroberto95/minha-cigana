import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../components/ui';

export function CardBack({ label, selected = false, disabled = false, onPress }: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const face = <View style={styles.frame}>
    <Text accessible={false} style={styles.mark}>✦</Text>
    <Text style={styles.label}>{label}</Text>
  </View>;

  if (!onPress) return <View style={[styles.card, styles.display]}>{face}</View>;

  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.card, selected && styles.selected, (pressed || disabled) && styles.faded]}>
    {face}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { padding: 5, minHeight: 92, borderWidth: 1, borderRadius: 10, borderColor: colors.border, backgroundColor: colors.surface },
  display: { width: 112, minHeight: 145, alignSelf: 'center' },
  frame: { flex: 1, padding: 5, gap: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: colors.gold },
  mark: { color: colors.gold, fontSize: 24 },
  label: { color: colors.cream, fontFamily: 'DMSans_600SemiBold', fontSize: 13, textAlign: 'center' },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  faded: { opacity: 0.55 },
});
