import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Title } from '../components/ui';

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();
  return <Screen back={false}>
    <Title>{t('notFound')}</Title>
    <Button label={t('home')} onPress={() => router.replace('/')} />
  </Screen>;
}
