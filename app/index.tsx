import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, colors, Copy, Panel, Screen, Title } from '../components/ui';

const portrait = require('../assets/personagem.png');

export default function Home() {
  return <Screen back={false}>
    <View style={styles.brand}>
      <View style={styles.mark}><Text style={styles.star}>✦</Text></View>
      <Copy emphasis>Cigana do Destino</Copy>
    </View>
    <Image source={portrait} style={styles.portrait} accessibilityLabel="Retrato da anfitriã virtual" />
    <Title>O que te trouxe aqui hoje?</Title>
    <Copy>Escolha uma leitura simbólica e reserve um momento para refletir.</Copy>
    <Copy>Versão de desenvolvimento. As leituras ainda estão em preparação.</Copy>
    <Button label="Começar leitura beta" disabled />
    <Button label="Carta do Dia" secondary disabled />
    <Panel>
      <Copy emphasis>Para ir mais fundo</Copy>
      <Button label="Leitura de personalidade" secondary disabled />
      <Button label="Tiragem de dez cartas" secondary disabled />
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
