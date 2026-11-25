import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Copy, Panel, Screen, Title } from '../../components/ui';
import { RitualLoader } from '../../components/RitualLoader';
import { withIdentityScope } from '../../lib/identity-scope';
import { spreadLabels, type Spread } from '../tarot/domain';
import { CardReveal } from '../tarot/CardReveal';
import { interpretDraw, readDraw, type TarotDraw } from '../tarot/tarot-api';
import { ReadingResult } from './ReadingScreens';

function TarotReadingContent({ format }: { format: Spread }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'preview' && format !== 'sim-ou-nao') return <ReadingResult format={format} />;
  return <TarotResult key={id} id={id} format={format} />;
}

function TarotResult({ id, format }: { id: string; format: Spread }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [draw, setDraw] = useState<TarotDraw>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const found = await readDraw(id, controller.signal);
      if (controller.signal.aborted) return;
      if (found.format !== format) throw new Error('Unexpected tarot format');
      setDraw(found);
      if (!found.reading) {
        const interpreted = await interpretDraw(id, controller.signal);
        if (controller.signal.aborted) return;
        setDraw(interpreted);
      }
      setStatus('ready');
    }
    void load().catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [id, format, attempt]);

  const structured = draw?.structuredReading;

  return <Screen backTo="/tarot">
    <Title>{t(spreadLabels[format])}</Title>
    {status === 'loading' && <RitualLoader label={t(draw ? 'interpretingSpread' : 'revealingSpread')}
      mode={draw ? 'reading' : 'cards'} />}
    {draw?.cards.map(({ card, position, orientation }, index) => {
      const interpretation = structured?.cards.find(({ cardId }) => cardId === card.id)?.interpretation;
      return <Panel key={card.id}>
        <Copy>{position}</Copy>
        <CardReveal id={card.id} inverted={orientation === 'invertida'} index={index} />
        <Copy emphasis>{card.name}</Copy>
        {orientation === 'invertida' && <Copy>{t('reversedCard')}</Copy>}
        {interpretation && <Copy>{interpretation}</Copy>}
      </Panel>;
    })}
    {structured && <Panel>
      <Copy emphasis>{t('readingSummary')}</Copy>
      <Copy>{structured.summary}</Copy>
      <Copy emphasis>{t('readingAdvice')}</Copy>
      <Copy>{structured.advice}</Copy>
    </Panel>}
    {!structured && draw?.reading && <Panel>
      <Copy emphasis>Madame Esmeralda</Copy>
      <Copy>{draw.reading}</Copy>
    </Panel>}
    {status === 'error' && <>
      <View role="status" accessibilityLiveRegion="polite"><Copy>{t(draw ? 'interpretationError' : 'drawError')}</Copy></View>
      <Button label={t('tryAgain')} onPress={() => {
        setStatus('loading');
        setAttempt((value) => value + 1);
      }} />
    </>}
    <Button label={t('tarot')} secondary onPress={() => router.dismissTo('/tarot')} />
    <Copy>{t('entertainmentNotice')}</Copy>
  </Screen>;
}

export const TarotReadingScreen = withIdentityScope(TarotReadingContent);
