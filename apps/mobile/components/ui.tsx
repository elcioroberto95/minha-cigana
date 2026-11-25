import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = {
  background: '#120C20', surface: '#251632', selected: '#493053',
  gold: '#D8B66A', cream: '#F5D99B', text: '#E9DBEB', muted: '#C7B9D0', border: '#554063',
};

export function Screen({ children, back = true, backTo = '/' }: { children: ReactNode; back?: boolean; backTo?: Href }) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe} edges={back ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.page}>
            {back && <Pressable accessibilityRole="button" accessibilityLabel={t('back')}
              onPress={() => router.canGoBack() ? router.back() : router.replace(backTo)} style={styles.back}>
              <Copy>‹  {t('back')}</Copy>
            </Pressable>}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} aria-pressed={selected} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, selected && styles.selected,
      (pressed || disabled) && styles.faded]}>
    <Text style={[styles.buttonLabel, secondary && styles.secondaryLabel]}>{label}</Text>
  </Pressable>;
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}>
    <Copy emphasis>{label}</Copy>
    <TextInput {...props} accessibilityLabel={label}
      style={[styles.input, props.multiline && styles.multiline, style]} />
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 18 },
  page: { width: '100%', maxWidth: 540, alignSelf: 'center', gap: 14, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  title: { fontFamily: 'Cinzel_600SemiBold', fontSize: 30, lineHeight: 38, color: colors.cream },
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
  field: { gap: 6 },
  input: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, color: colors.text, backgroundColor: colors.surface, fontFamily: 'DMSans_400Regular', fontSize: 16 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});
