import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, type TextStyle } from 'react-native';
import { colors } from '../../components/ui';

function tabIcon(symbol: string) {
  return function TabIcon({ color }: { color: TextStyle['color'] }) {
    return <Text accessible={false} style={{ color, fontSize: 19 }}>{symbol}</Text>;
  };
}

export default function MainTabs() {
  const { t } = useTranslation();
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarLabelPosition: 'below-icon',
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    tabBarActiveTintColor: colors.cream,
    tabBarInactiveTintColor: colors.muted,
    tabBarLabelStyle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  }}>
    <Tabs.Screen name="index" options={{ title: t('home'), tabBarAccessibilityLabel: t('home'), tabBarIcon: tabIcon('⌂') }} />
    <Tabs.Screen name="tarot" options={{ title: t('tarot'), tabBarAccessibilityLabel: t('tarot'), tabBarIcon: tabIcon('✧') }} />
    <Tabs.Screen name="historico" options={{ title: t('history'), tabBarAccessibilityLabel: t('history'), tabBarIcon: tabIcon('◷') }} />
    <Tabs.Screen name="perfil" options={{ title: t('profile'), tabBarAccessibilityLabel: t('profile'), tabBarIcon: tabIcon('◎') }} />
  </Tabs>;
}
