import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, colors, Copy, Panel, Screen, Title } from '../../components/ui';
import { TopicPicker } from '../tarot/TopicPicker';

const portrait = require('../../assets/personagem.png');

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [coverWidth, setCoverWidth] = useState(0);
  const coverHeight = coverWidth ? Math.min(200, Math.round(coverWidth / 2.5)) : 160;
  return <Screen back={false}>
    <View style={styles.brand}>
      <View style={styles.mark}><Text style={styles.star}>✦</Text></View>
      <Copy emphasis>Cigana do Destino</Copy>
    </View>
    <View style={[styles.cover, { height: coverHeight }]}
      onLayout={({ nativeEvent }) => setCoverWidth(nativeEvent.layout.width)}>
      {coverWidth > 0 && <Image source={portrait} resizeMode="stretch"
        style={{ width: coverWidth, height: coverWidth * 2 / 3 }} accessibilityLabel={t('portrait')} />}
    </View>
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

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 29, height: 34, borderWidth: 1, borderColor: colors.gold, borderTopLeftRadius: 16,
    borderTopRightRadius: 16, alignItems: 'center', justifyContent: 'center' },
  star: { color: colors.gold, fontSize: 20 },
  intro: { gap: 8 },
  cover: { width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface },
});
