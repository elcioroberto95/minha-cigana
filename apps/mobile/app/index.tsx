import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LanguagePicker } from '../components/LanguagePicker';
import { Button, colors, Copy, Panel, Screen, Title } from '../components/ui';

const portrait = require('../assets/personagem.png');

export default function Home() {
  const { t } = useTranslation();
  return <Screen back={false}>
    <View style={styles.brand}>
      <View style={styles.mark}><Text style={styles.star}>✦</Text></View>
      <Copy emphasis>Cigana do Destino</Copy>
    </View>
    <LanguagePicker />
    <Image source={portrait} style={styles.portrait} accessibilityLabel={t('portrait')} />
    <Title>{t('homeTitle')}</Title>
    <Copy>{t('homeIntro')}</Copy>
    <Copy>{t('developmentNotice')}</Copy>
    <Button label={t('startBeta')} disabled />
    <Button label={t('dailyCard')} secondary disabled />
    <Panel>
      <Copy emphasis>{t('goDeeper')}</Copy>
      <Button label={t('personalityReading')} secondary disabled />
      <Button label={t('tenCardReading')} secondary disabled />
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
