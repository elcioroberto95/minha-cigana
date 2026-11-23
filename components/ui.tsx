import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = {
  background: '#160D25', surface: '#29163D', selected: '#4B345E',
  gold: '#D8B66A', cream: '#F5D99B', text: '#E9DBEB', muted: '#BDAFC9', border: '#594166',
};

export function Screen({ children, back = true }: { children: ReactNode; back?: boolean }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.page}>
          {back && <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.back}>
            <Copy>‹  Voltar</Copy>
          </Pressable>}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text accessibilityRole="header" style={styles.title}>{children}</Text>;
}

export function Copy({ children, emphasis = false }: { children: ReactNode; emphasis?: boolean }) {
  return <Text style={emphasis ? styles.emphasis : styles.copy}>{children}</Text>;
}

export function Panel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

export function Button({ label, onPress, secondary = false, disabled = false, selected }: {
  label: string; onPress?: () => void; secondary?: boolean; disabled?: boolean; selected?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, selected && styles.selected,
      (pressed || disabled) && styles.faded]}>
    <Text style={[styles.buttonLabel, secondary && styles.secondaryLabel]}>{label}</Text>
  </Pressable>;
}

export function DemoNotice() {
  return <Copy>Demonstração com textos editoriais. Leitura simbólica para entretenimento e reflexão.</Copy>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 18 },
  page: { width: '100%', maxWidth: 540, alignSelf: 'center', gap: 14, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  title: { fontFamily: 'DMSerifText_400Regular', fontSize: 35, lineHeight: 42, color: colors.cream },
  copy: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24, color: colors.muted },
  emphasis: { fontFamily: 'DMSans_600SemiBold', fontSize: 17, lineHeight: 24, color: colors.text },
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, gap: 9, padding: 16 },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.gold },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  faded: { opacity: 0.55 },
  buttonLabel: { fontFamily: 'DMSans_600SemiBold', textAlign: 'center', color: colors.background, fontSize: 16 },
  secondaryLabel: { color: colors.cream },
});
