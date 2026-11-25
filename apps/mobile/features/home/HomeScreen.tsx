import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { MysticSoundToggle } from '../../components/MysticSound';
import { Button, colors, Copy, Panel, Screen, Title } from '../../components/ui';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { TopicPicker } from '../tarot/TopicPicker';

const portrait = require('../../assets/personagem.png');

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen back={false}>
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.mark}><Text aria-hidden style={styles.star}>✦</Text></View>
        <Text style={styles.brandName}>Cigana do Destino</Text>
      </View>
      <MysticSoundToggle />
    </View>
    <Portrait />
    <View style={styles.intro}>
      <Title>{t('homeTitle')}</Title>
      <Copy>{t('homeIntro')}</Copy>
      <Button label={t('chat')} onPress={() => router.push('/consulta')} />
    </View>
    <Button label={t('startBeta')} secondary onPress={() => router.push('/leituras/beta')} />
    <Button label={t('dailyCard')} secondary onPress={() => router.push('/carta-do-dia')} />
    <Panel>
      <TopicPicker onSelect={(topic) => router.push({ pathname: '/consulta', params: { topic } })} />
    </Panel>
  </Screen>;
}

function Portrait() {
  const { t } = useTranslation();
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  const [breath] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!focused || reduced !== false) {
      breath.setValue(0);
      return;
    }
    const ease = Easing.inOut(Easing.sin);
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 3200, easing: ease, useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.timing(breath, { toValue: 0, duration: 3200, easing: ease, useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [breath, focused, reduced]);

  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] });
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.95] });
  return <View style={styles.cover}>
    <Animated.Image source={portrait} resizeMode="cover" accessibilityLabel={t('portrait')}
      style={[StyleSheet.absoluteFill, styles.picture, { transform: [{ scale }] }]} />
    <View pointerEvents="none" style={styles.coverFrame} />
    <Animated.View pointerEvents="none" accessible={false} aria-hidden style={[styles.sparkles, { opacity }]}>
      <Text style={styles.sparkLeft}>✧</Text>
      <Text style={styles.sparkRight}>✦</Text>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { color: colors.cream, fontFamily: 'Cinzel_600SemiBold', fontSize: 14, flexShrink: 1 },
  mark: { width: 29, height: 34, borderWidth: 1, borderColor: colors.gold, borderTopLeftRadius: 16,
    borderTopRightRadius: 16, alignItems: 'center', justifyContent: 'center' },
  star: { color: colors.gold, fontSize: 20 },
  intro: { gap: 8 },
  cover: { width: '100%', aspectRatio: 1.55, borderTopLeftRadius: 42, borderTopRightRadius: 42, borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold },
  picture: { width: '100%', height: '100%' },
  coverFrame: { ...StyleSheet.absoluteFill, margin: 5, borderTopLeftRadius: 36, borderTopRightRadius: 36,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 1, borderColor: '#d8b66a70' },
  sparkles: StyleSheet.absoluteFill,
  sparkLeft: { position: 'absolute', left: '8%', bottom: '18%', color: colors.cream, fontSize: 27 },
  sparkRight: { position: 'absolute', right: '9%', top: '20%', color: colors.cream, fontSize: 22 },
});
