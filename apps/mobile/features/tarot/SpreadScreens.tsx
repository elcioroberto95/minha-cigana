import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withIdentityScope } from '../../lib/identity-scope';
import { StyleSheet, View } from 'react-native';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { RitualLoader } from '../../components/RitualLoader';
import { useCardSound } from '../../components/MysticSound';
import { useQuestionDraft } from '../chat/DraftProvider';
import { CardBack } from './CardBack';
import { isSpread, isTopic, spreadSizes, type Spread, type Topic } from './domain';
import { ShuffleDeck } from './ShuffleDeck';
import { TopicPicker } from './TopicPicker';
import { createDraw } from './tarot-api';

const resultRoutes = {
  'tres-cartas': '/leituras/[id]/tres-cartas',
  'sim-ou-nao': '/leituras/[id]/sim-ou-nao',
  'dez-cartas': '/leituras/[id]/dez-cartas',
} as const;

export function TarotScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return <Screen back={false}>
    <Title>{t('tarot')}</Title>
    <Panel>
      <Copy emphasis>{t('dailyCard')}</Copy>
      <Copy>{t('dailyIntro')}</Copy>
      <Button label={t('openDaily')} onPress={() => router.push('/carta-do-dia')} />
    </Panel>
    <Panel>
      <Copy emphasis>{t('threeCards')}</Copy>
      <Copy>{t('betaIntro')}</Copy>
      <Button label={t('startBeta')} secondary onPress={() => router.push('/leituras/beta')} />
    </Panel>
    <Panel>
      <Button label={t('yesNoSpread')} secondary onPress={() => router.push({
        pathname: '/tarot/[formato]/preparar', params: { formato: 'sim-ou-nao' },
      })} />
      <Button label={t('tenCardReading')} secondary onPress={() => router.push('/leituras/dez-cartas')} />
      <Button label={t('personalityReading')} secondary onPress={() => router.push('/leituras/personalidade')} />
    </Panel>
  </Screen>;
}

export function BetaScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from, topic } = useLocalSearchParams<{ from?: string; topic?: string }>();
  return <Screen backTo="/tarot">
    <Title>{t('threeCards')}</Title>
    <Copy>{t('betaIntro')}</Copy>
    <Button label={t('prepareReading')} onPress={() => router.push({
      pathname: '/tarot/[formato]/preparar',
      params: { formato: 'tres-cartas', ...(from === 'chat' && { from }), ...(isTopic(topic) && { topic }) },
    })} />
  </Screen>;
}

function PrepareSpreadContent() {
  const { formato, from, topic } = useLocalSearchParams<{ formato: string; from?: string; topic?: string }>();
  const { question } = useQuestionDraft();
  if (!isSpread(formato)) return <MissingSpread />;
  return <PrepareSpread key={formato} spread={formato} initialTopic={isTopic(topic) ? topic : 'general'}
    initialQuestion={from === 'chat' ? question : ''} />;
}

function PrepareSpread({ spread, initialTopic, initialQuestion }: {
  spread: Spread; initialTopic: Topic; initialQuestion: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [question, setQuestion] = useState(initialQuestion);
  const { setReadingQuestion } = useQuestionDraft();

  function pickCards() {
    setReadingQuestion(question.trim());
    router.push({
      pathname: '/tarot/[formato]/escolher',
      params: { formato: spread, topic },
    });
  }

  return <Screen backTo="/tarot">
    <Title>{t('prepareReading')}</Title>
    <TopicPicker value={topic} onSelect={setTopic} />
    <Field label={t('optionalQuestion')} value={question} onChangeText={setQuestion} multiline maxLength={500} />
    <Button label={t('pickCards')} onPress={pickCards} />
  </Screen>;
}

function SelectSpreadContent() {
  const { formato, topic } = useLocalSearchParams<{ formato: string; topic?: string }>();
  if (!isSpread(formato)) return <MissingSpread />;
  return <SelectSpread key={formato} spread={formato} topic={isTopic(topic) ? topic : 'general'} />;
}

function SelectSpread({ spread, topic }: { spread: Spread; topic: Topic }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [deckReady, setDeckReady] = useState(false);
  const finishShuffle = useCallback(() => setDeckReady(true), []);
  const playCue = useCardSound();
  const { readingQuestion } = useQuestionDraft();
  const count = spreadSizes[spread];
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const active = useRef<AbortController | null>(null);
  const previousDraw = useRef<{ id: string; selection: string } | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  async function reveal() {
    if (active.current || selected.length !== count) return;
    const selection = selected.join(',');
    if (previousDraw.current?.selection !== selection) previousDraw.current = { id: randomUUID(), selection };
    const controller = new AbortController();
    active.current = controller;
    setFailed(false);
    setPending(true);
    try {
      const draw = await createDraw({
        id: previousDraw.current.id, format: spread, locale: i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR',
        topic, question: readingQuestion, slots: selected,
      }, controller.signal);
      if (!controller.signal.aborted) {
        playCue('reveal');
        router.push({ pathname: resultRoutes[spread], params: { id: draw.id } });
      }
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return <Screen backTo={{ pathname: '/tarot/[formato]/preparar', params: { formato: spread, topic } }}>
    <Title>{t('pickCards')}</Title>
    <Copy>{t(topic)} · {selected.length}/{count}</Copy>
    {readingQuestion && <Copy>{t('questionReady')}</Copy>}
    {!deckReady ? <ShuffleDeck onDone={finishShuffle} /> : <>
      <View style={styles.cards}>
        {Array.from({ length: count + 4 }, (_, index) => {
          const position = selected.indexOf(index);
          return <View key={index} style={styles.card}>
            <CardBack label={t(position < 0 ? 'cardChoice' : 'cardSelected', { number: position < 0 ? index + 1 : position + 1 })}
              selected={position >= 0} disabled={pending || (position < 0 && selected.length === count)}
              onPress={() => {
                playCue('select');
                setSelected((current) => current.includes(index)
                  ? current.filter((item) => item !== index)
                  : current.length < count ? [...current, index] : current);
              }} />
          </View>;
        })}
      </View>
      <Button label={t('undoLastCard')} secondary disabled={pending || !selected.length} onPress={() => setSelected((current) => current.slice(0, -1))} />
      {failed && <View role="status" accessibilityLiveRegion="polite"><Copy>{t('drawError')}</Copy></View>}
      {pending && <RitualLoader label={t('revealingSpread')} mode="cards" />}
      <Button label={t(pending ? 'revealingSpread' : 'revealSpread')}
        disabled={pending || selected.length !== count} onPress={() => void reveal()} />
    </>}
  </Screen>;
}

function MissingSpread() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen>
    <Title>{t('missingSpread')}</Title>
    <Button label={t('tarot')} onPress={() => router.replace('/tarot')} />
  </Screen>;
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexBasis: '31%' },
});

export const PrepareSpreadScreen = withIdentityScope(PrepareSpreadContent);
export const SelectSpreadScreen = withIdentityScope(SelectSpreadContent);
