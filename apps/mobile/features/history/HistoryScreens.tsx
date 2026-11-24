import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Panel, Screen, Title } from '../../components/ui';

const filters = ['allRecords', 'chat', 'spreads'] as const;

export function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>('allRecords');

  return <Screen back={false}>
    <Title>{t('history')}</Title>
    <Panel>
      {filters.map((item) => <Button key={item} label={t(item)} secondary selected={item === filter} onPress={() => setFilter(item)} />)}
    </Panel>
    <Copy>{t('emptyHistory')}</Copy>
    <Button label={t('chooseSpread')} onPress={() => router.navigate('/tarot')} />
  </Screen>;
}

export function HistoryDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen backTo="/historico">
    <Title>{t('historyDetail')}</Title>
    <Copy>{t('missingRecord')}</Copy>
    <Button label={t('history')} onPress={() => router.dismissTo('/historico')} />
  </Screen>;
}
