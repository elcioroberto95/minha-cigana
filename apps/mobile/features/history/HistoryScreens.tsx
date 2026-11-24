import { withIdentityScope } from '../../lib/identity-scope';
import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Panel, Screen, Title } from '../../components/ui';
import { deleteConversation, getConversation, listConversations, type SavedConversation, type SavedSession } from './history-api';

const filters = ['allRecords', 'chat', 'spreads'] as const;

function HistoryScreenContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [filter, setFilter] = useState<(typeof filters)[number]>('allRecords');
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!isFocused) return;
    const controller = new AbortController();
    void listConversations(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setSessions(items);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [isFocused, revision]);

  return <Screen back={false}>
    <Title>{t('history')}</Title>
    <Panel>
      {filters.map((item) => <Button key={item} label={t(item)} secondary selected={item === filter} onPress={() => setFilter(item)} />)}
    </Panel>
    {filter === 'spreads' ? <Copy>{t('emptySpreads')}</Copy> : <>
      {status === 'loading' && <Copy>{t('historyLoading')}</Copy>}
      {status === 'error' && <>
        <Copy>{t('historyLoadError')}</Copy>
        <Button label={t('tryAgain')} secondary onPress={() => {
          setStatus('loading');
          setRevision((value) => value + 1);
        }} />
      </>}
      {status === 'ready' && (sessions.length ? sessions.map((session) => <Panel key={session.id}>
        <Copy emphasis>{session.title}</Copy>
        <Copy>{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium' }).format(new Date(session.updatedAt))}</Copy>
        <Button label={t('openConversation', { title: session.title })} secondary
          onPress={() => router.push({ pathname: '/historico/[id]', params: { id: session.id } })} />
      </Panel>) : <Copy>{t('emptyHistory')}</Copy>)}
    </>}
    <Button label={t('chooseSpread')} onPress={() => router.navigate('/tarot')} />
  </Screen>;
}

function HistoryDetailScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<SavedConversation | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [revision, setRevision] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  useEffect(() => {
    if (!isFocused) return;
    const controller = new AbortController();
    void getConversation(id, controller.signal).then((record) => {
      if (controller.signal.aborted) return;
      setSession(record);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [id, isFocused, revision]);

  async function remove() {
    setDeleting(true);
    setDeleteFailed(false);
    try {
      await deleteConversation(id);
      router.dismissTo('/historico');
    } catch {
      setDeleteFailed(true);
    } finally {
      setDeleting(false);
    }
  }

  return <Screen backTo="/historico">
    <Title>{status === 'ready' && session ? session.title : t('historyDetail')}</Title>
    {status === 'loading' && <Copy>{t('historyLoading')}</Copy>}
    {status === 'error' && <>
      <Copy>{t('historyLoadError')}</Copy>
      <Button label={t('tryAgain')} secondary onPress={() => {
        setStatus('loading');
        setRevision((value) => value + 1);
      }} />
    </>}
    {status === 'ready' && (session ? <>
      {session.messages.map((message, index) => <Panel key={index}>
        <Copy emphasis>{message.role === 'assistant' ? 'Madame Esmeralda' : t('chatYou')}</Copy>
        <Copy>{message.content}</Copy>
      </Panel>)}
      {confirming ? <Panel>
        <Copy>{t('deleteConversationConfirm')}</Copy>
        <Button label={t('deleteConversation')} disabled={deleting} onPress={() => void remove()} />
        <Button label={t('cancel')} disabled={deleting} secondary onPress={() => setConfirming(false)} />
        {deleteFailed && <Copy>{t('deleteConversationError')}</Copy>}
      </Panel> : <Button label={t('deleteConversation')} secondary onPress={() => setConfirming(true)} />}
    </> : <>
      <Copy>{t('missingRecord')}</Copy>
      <Button label={t('history')} onPress={() => router.dismissTo('/historico')} />
    </>)}
  </Screen>;
}

export const HistoryScreen = withIdentityScope(HistoryScreenContent);

export const HistoryDetailScreen = withIdentityScope(HistoryDetailScreenContent);
