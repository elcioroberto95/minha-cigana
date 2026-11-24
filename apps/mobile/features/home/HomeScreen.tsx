import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Button, colors, Copy, Panel, Screen, Title } from '../../components/ui';
import { TopicPicker } from '../tarot/TopicPicker';

const portrait = require('../../assets/personagem.png');

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen back={false}>
    <View style={styles.brand}>
      <View style={styles.mark}><Text style={styles.star}>✦</Text></View>
      <Copy emphasis>Cigana do Destino</Copy>
    </View>
    <LanguagePicker />
    <Image source={portrait} style={styles.portrait} accessibilityLabel={t('portrait')} />
    <Title>{t('homeTitle')}</Title>
    <Copy>{t('homeIntro')}</Copy>
    <Button label={t('chat')} onPress={() => router.push('/consulta')} />
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
  portrait: { width: '100%', aspectRatio: 1.9, borderRadius: 20, backgroundColor: colors.surface },
});
