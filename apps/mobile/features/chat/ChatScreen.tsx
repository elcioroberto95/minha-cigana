import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { saveConversation, savedMessageLimit } from '../history/history-api';
import { isTopic, type Topic } from '../tarot/domain';
import { TopicPicker } from '../tarot/TopicPicker';
import { requestReply, type ChatMessage } from './chat-api';
import { useQuestionDraft } from './DraftProvider';

const portrait = require('../../assets/personagem.png');

export default function ChatScreen() {
  const params = useLocalSearchParams<{ topic?: string; dailyCardId?: string }>();
  const dailyCardId = typeof params.dailyCardId === 'string' ? params.dailyCardId : undefined;
  const [topic, setTopic] = useState<Topic>(isTopic(params.topic) ? params.topic : 'general');
  const { question, setQuestion } = useQuestionDraft();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState('');
  const [failed, setFailed] = useState(false);
  const [savedLength, setSavedLength] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const sessionId = useRef<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function send() {
    const message = question.trim();
    if (activeRequest.current || !message) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(message);
    setFailed(false);

    try {
      const { reply, model } = await requestReply({
        locale: i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR',
        topic, message, history: history.slice(-8), dailyCardId,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setHistory([...history, { role: 'user', content: message }, { role: 'assistant', content: reply, model }]);
      setQuestion('');
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setPending('');
    }
  }

  async function save() {
    setSaveStatus('saving');
    try {
      sessionId.current ??= randomUUID();
      await saveConversation(sessionId.current, topic, history);
      setSavedLength(history.length);
      setSaveStatus('idle');
    } catch {
      setSaveStatus('error');
    }
  }

  return <Screen>
    <Title>{t('chat')}</Title>
    <Panel>
      <View style={styles.guide}>
        <Image source={portrait} style={styles.avatar} accessibilityLabel={t('portrait')} />
        <Copy emphasis>Madame Esmeralda</Copy>
      </View>
      <Copy>{t('chatWelcome')}</Copy>
      {dailyCardId && <Copy emphasis>{t('dailyChatContext')}</Copy>}
    </Panel>
    {history.map(({ role, content }, index) => <Panel key={index}>
      <Copy emphasis>{role === 'assistant' ? 'Madame Esmeralda' : t('chatYou')}</Copy>
      <Copy>{content}</Copy>
    </Panel>)}
    {!!pending && <Panel>
      <Copy emphasis>{t('chatYou')}</Copy>
      <Copy>{pending}</Copy>
      <View accessibilityLiveRegion="polite"><Copy>{t('chatThinking')}</Copy></View>
    </Panel>}
    {failed && <View accessibilityLiveRegion="polite"><Copy>{t('chatUnavailable')}</Copy></View>}
    <TopicPicker value={topic} onSelect={setTopic} />
    <Field label={t('question')} value={question} onChangeText={setQuestion} editable={!pending} multiline maxLength={500} />
    <View style={styles.actions}>
      <View style={styles.action}><Button label={t('record')} secondary disabled /></View>
      <View style={styles.action}><Button label={t('send')} disabled={!!pending || !question.trim()} onPress={() => void send()} /></View>
    </View>
    {history.length > 0 && <Panel>
      <Copy>{t(history.length > savedMessageLimit ? 'conversationTooLong' : 'saveConversationPrivacy')}</Copy>
      <Button label={t(history.length === savedLength ? 'conversationSaved' : 'saveConversation')} secondary
        disabled={!!pending || saveStatus === 'saving' || history.length === savedLength || history.length > savedMessageLimit}
        onPress={() => void save()} />
      {saveStatus === 'saving' && <Copy>{t('savingConversation')}</Copy>}
      {saveStatus === 'error' && <Copy>{t('saveConversationError')}</Copy>}
    </Panel>}
    <Button label={t('threeCards')} secondary onPress={() => router.push({
      pathname: '/leituras/beta',
      params: { topic, from: 'chat' },
    })} />
  </Screen>;
}

const styles = StyleSheet.create({
  guide: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 53, height: 53, borderRadius: 27 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1 },
});
