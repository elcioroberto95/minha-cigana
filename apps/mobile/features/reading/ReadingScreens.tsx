import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { CardBack } from '../tarot/CardBack';
import { isTopic } from '../tarot/domain';

const questions = ['personalityQuestion1', 'personalityQuestion2', 'personalityQuestion3'] as const;

export function DailyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen>
    <Title>{t('dailyCard')}</Title>
    <Copy>{t('dailyIntro')}</Copy>
    <Panel>
      <CardBack label={t('dailyCard')} />
      <Copy>{t('dailyCadence')}</Copy>
    </Panel>
    <Copy>{t('readingUnavailable')}</Copy>
    <Button label={t('openDaily')} disabled />
    <Button label={t('dailyOffer')} secondary onPress={() => router.push('/carta-do-dia/oferta')} />
  </Screen>;
}

export function DailyOfferScreen() {
  return <Offer title="dailyOffer" description="dailyOfferIntro" action="buy" />;
}

export function TenCardOfferScreen() {
  return <Offer title="tenCardReading" description="tenIntro" action="prepareReading"
    next={{ pathname: '/tarot/[formato]/preparar', params: { formato: 'dez-cartas' } }} />;
}

export function PersonalityOfferScreen() {
  return <Offer title="personalityReading" description="personalityIntro" action="personalityStart"
    next="/leituras/personalidade/perguntas" />;
}

function Offer({ title, description, action, next }: {
  title: 'dailyOffer' | 'tenCardReading' | 'personalityReading';
  description: 'dailyOfferIntro' | 'tenIntro' | 'personalityIntro';
  action: 'buy' | 'prepareReading' | 'personalityStart';
  next?: Href;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen backTo={title === 'dailyOffer' ? '/carta-do-dia' : '/tarot'}>
    <Title>{t(title)}</Title>
    <Panel><Copy>{t(description)}</Copy></Panel>
    <Copy>{t(next ? 'readingUnavailable' : 'purchaseUnavailable')}</Copy>
    <Button label={t(action)} disabled={!next} onPress={next ? () => router.push(next) : undefined} />
  </Screen>;
}

export function PersonalityQuestionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);

  function editAnswer(value: string) {
    setAnswers((current) => current.map((answer, index) => index === step ? value : answer));
  }

  function next() {
    if (step < questions.length - 1) setStep(step + 1);
    else router.push({ pathname: '/leituras/[id]/personalidade', params: { id: 'preview' } });
  }

  return <Screen backTo="/leituras/personalidade">
    <Title>{t('personalityReading')}</Title>
    <Panel>
      <Copy>{step + 1}/{questions.length}</Copy>
      <Field label={t(questions[step])} value={answers[step]} onChangeText={editAnswer} multiline maxLength={500} />
    </Panel>
    {answers[step].trim().length > 0 && <Button label={t('continue')} onPress={next} />}
    <Button label={t('skipQuestion')} secondary onPress={() => { editAnswer(''); next(); }} />
    {step > 0 && <Button label={t('previousQuestion')} secondary onPress={() => setStep(step - 1)} />}
  </Screen>;
}

const resultSections = {
  'tres-cartas': ['past', 'present', 'symbolicFuture'],
  'dez-cartas': ['threeStrengths', 'threeChallenges', 'symbolicFuture', 'nextStep'],
  personalidade: ['strengths', 'patterns', 'nextStep'],
} as const;

export function ReadingResult({ format }: { format: keyof typeof resultSections }) {
  const { id, topic } = useLocalSearchParams<{ id: string; topic?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen>
    <Title>{t(format === 'tres-cartas' ? 'threeCards' : format === 'dez-cartas' ? 'tenCardReading' : 'personalityReading')}</Title>
    {id === 'preview' ? <>
      <Copy>{t('resultPreview')}</Copy>
      {isTopic(topic) && <Copy>{t(topic)}</Copy>}
      {resultSections[format].map((section) => (
        <Panel key={section}><Copy emphasis>{t(section)}</Copy></Panel>
      ))}
      {format !== 'personalidade' && <Button label={t('discussReading')} secondary onPress={() => router.push({
        pathname: '/consulta',
        params: isTopic(topic) ? { topic } : {},
      })} />}
    </> : <Copy>{t('readingUnavailable')}</Copy>}
    <Button label={t('home')} onPress={() => router.dismissTo('/')} />
  </Screen>;
}
