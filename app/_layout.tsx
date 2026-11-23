import { DMSans_400Regular, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../components/ui';

export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_600SemiBold, DMSerifText_400Regular });
  if (!loaded && !error) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator color={colors.gold} />
  </View>;

  return <>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  </>;
}
