import { withIdentityScope } from '../../lib/identity-scope';
import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, View } from 'react-native';
import { Button, colors, Copy, Panel, Screen, Title } from '../../components/ui';
import { RitualLoader } from '../../components/RitualLoader';
import { useCardSound } from '../../components/MysticSound';
import { CardBack } from '../tarot/CardBack';
import { CardReveal } from '../tarot/CardReveal';
import { getDailyCard, revealDailyCard, type DailyDraw } from './daily-card-api';

type ViewState =
  | { phase: 'loading' | 'revealing' | 'error' }
  | { phase: 'ready'; draw: DailyDraw | null; revisited: boolean };

function DailyCardScreenContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const focused = useIsFocused();
  const playCue = useCardSound();
  const [state, setState] = useState<ViewState>({ phase: 'loading' });
  const [revision, setRevision] = useState(0);
  const activeRead = useRef<AbortController | null>(null);
  const activeReveal = useRef<AbortController | null>(null);
  const locale = i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR';

  useEffect(() => {
    if (!focused) return;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && !activeReveal.current) setRevision((value) => value + 1);
    });
    return () => subscription.remove();
  }, [focused]);

  useEffect(() => {
    if (!focused) return;
    const controller = new AbortController();
    activeRead.current = controller;
    void getDailyCard(controller.signal).then((draw) => {
      if (!controller.signal.aborted && !activeReveal.current) {
        setState({ phase: 'ready', draw, revisited: !!draw });
      }
    }).catch(() => {
      if (!controller.signal.aborted && !activeReveal.current) setState({ phase: 'error' });
    });
    return () => {
      controller.abort();
      if (activeRead.current === controller) activeRead.current = null;
    };
  }, [focused, revision]);

  useEffect(() => () => activeReveal.current?.abort(), []);

  async function reveal() {
    if (activeReveal.current) return;
    const controller = new AbortController();
    activeReveal.current = controller;
    activeRead.current?.abort();
    setState({ phase: 'revealing' });
    try {
      const draw = await revealDailyCard(controller.signal);
      if (!controller.signal.aborted) {
        playCue('reveal');
        setState({ phase: 'ready', draw, revisited: false });
      }
    } catch {
      if (!controller.signal.aborted) setState({ phase: 'error' });
    } finally {
      activeReveal.current = null;
    }
  }

  return <Screen>
    <Title>{t('dailyCard')}</Title>
    {state.phase === 'ready' && state.draw ? <>
      {state.revisited && <Copy>{t('dailyAlreadyOpened')}</Copy>}
      <DailyResult draw={state.draw} locale={locale} animate={!state.revisited} />
      <Button label={t('discussDailyCard')} onPress={() => router.push({
        pathname: '/consulta',
        params: { dailyCardId: state.draw?.id },
      })} />
    </> : <>
      <Copy>{t('dailyIntro')}</Copy>
      <Panel>
        <CardBack label={t('dailyCard')} />
        <Copy>{t('dailyCadence')}</Copy>
      </Panel>
      {state.phase === 'ready' && <Button label={t('revealDailyCard')} onPress={() => void reveal()} />}
      {(state.phase === 'loading' || state.phase === 'revealing') && <RitualLoader mode="cards"
        label={t(state.phase === 'loading' ? 'dailyLoading' : 'dailyRevealing')} />}
      {state.phase === 'error' && <>
        <Copy>{t('dailyError')}</Copy>
        <Button label={t('tryAgain')} onPress={() => {
          setState({ phase: 'loading' });
          setRevision((value) => value + 1);
        }} />
      </>}
    </>}
  </Screen>;
}

function DailyResult({ draw, locale, animate }: { draw: DailyDraw; locale: 'pt-BR' | 'en-US'; animate: boolean }) {
  const { t } = useTranslation();
  const reading = draw.card.readings[locale];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(draw.date + 'T00:00:00Z'));

  return <>
    <View style={styles.face}>
      <View style={styles.border}>
        <CardReveal id={draw.card.key} animate={animate} large />
        <Copy>{draw.card.numeral}</Copy>
        <Title>{reading.title}</Title>
        <Copy emphasis>{reading.theme}</Copy>
      </View>
    </View>
    <Copy>{date}</Copy>
    <Panel>
      <Copy emphasis>{t('dailyReflection')}</Copy>
      <Copy>{reading.reflection}</Copy>
      <Copy emphasis>{t('dailyAction')}</Copy>
      <Copy>{reading.action}</Copy>
    </Panel>
  </>;
}

const styles = StyleSheet.create({
  face: { padding: 8, borderWidth: 1, borderColor: colors.gold, borderRadius: 20, backgroundColor: colors.surface },
  border: { alignItems: 'center', padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
});

export default withIdentityScope(DailyCardScreenContent);
