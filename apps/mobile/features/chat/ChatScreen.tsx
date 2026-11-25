import { withIdentityScope } from '../../lib/identity-scope';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Copy, Field, Panel, Screen, Title } from '../../components/ui';
import { RitualLoader } from '../../components/RitualLoader';
import { saveConversation, savedMessageLimit } from '../history/history-api';
import { isTopic, type Topic } from '../tarot/domain';
import { TopicPicker } from '../tarot/TopicPicker';
import { maxChatHistory, requestReply, type ChatMessage } from './chat-api';
import { useQuestionDraft } from './DraftProvider';
import { VoiceQuestion } from './VoiceQuestion';
import { useSpeechPlayback } from './speech';

const portrait = require('../../assets/personagem.png');

function ChatScreenContent() {
  const params = useLocalSearchParams<{ topic?: string; dailyCardId?: string; drawId?: string }>();
  const drawId = typeof params.drawId === 'string' ? params.drawId : undefined;
  const dailyCardId = typeof params.dailyCardId === 'string' ? params.dailyCardId : undefined;
  const [topic, setTopic] = useState<Topic>(isTopic(params.topic) ? params.topic : 'general');
  const { question, setQuestion } = useQuestionDraft();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState('');
  const [failed, setFailed] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [replyMode, setReplyMode] = useState<'text' | 'audio'>('text');
  const locale = i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR';
  const playback = useSpeechPlayback(locale);
  const repliedIn = useRef(false);
  const [savedLength, setSavedLength] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const sessionId = useRef<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem('cigana.reply-mode').then((mode) => {
      if (mounted && !repliedIn.current && mode === 'audio') setReplyMode('audio');
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  function changeReplyMode(mode: 'text' | 'audio') {
    repliedIn.current = true;
    setReplyMode(mode);
    if (mode === 'text') playback.stop();
    void AsyncStorage.setItem('cigana.reply-mode', mode).catch(() => {});
  }

  async function send(message = question.trim()) {
    if (activeRequest.current || !message) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(message);
    setFailed(false);

    try {
      const { reply, model } = await requestReply({
        locale, topic, message, history: history.slice(-maxChatHistory), dailyCardId, drawId,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setHistory([...history, { role: 'user', content: message }, { role: 'assistant', content: reply, model }]);
      setQuestion('');
      if (replyMode === 'audio') playback.speak(reply);
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
      {drawId && <Copy emphasis>{t('spreadChatContext')}</Copy>}
    </Panel>
    {history.map(({ role, content }, index) => <Panel key={index}>
      <Copy emphasis>{role === 'assistant' ? 'Madame Esmeralda' : t('chatYou')}</Copy>
      <Copy>{content}</Copy>
    </Panel>)}
    {!!pending && <Panel>
      <Copy emphasis>{t('chatYou')}</Copy>
      <Copy>{pending}</Copy>
    </Panel>}
    {!drawId && <TopicPicker value={topic} onSelect={setTopic} />}
    <Copy emphasis>{t('replyMode')}</Copy>
    <View style={styles.actions}>
      <View style={styles.action}><Button label={t('replyText')} secondary selected={replyMode === 'text'} disabled={!!pending} onPress={() => changeReplyMode('text')} /></View>
      <View style={styles.action}><Button label={t('replyAudio')} secondary selected={replyMode === 'audio'} disabled={!!pending} onPress={() => changeReplyMode('audio')} /></View>
    </View>
    {history.at(-1)?.role === 'assistant' && <Button label={t(playback.speaking ? 'stopSpeech' : 'listenSpeech')} secondary
      onPress={() => playback.speaking ? playback.stop() : playback.speak(history.at(-1)!.content)} />}
    {playback.speechFailed && <Copy>{t('speechPlaybackError')}</Copy>}
    <Field label={t('question')} value={question} onChangeText={setQuestion} editable={!pending && !voiceBusy} multiline maxLength={500} />
    <View>
      {!!pending && <View style={styles.requestStatus}><RitualLoader label={t('chatThinking')} mode="consultation" /></View>}
      {failed && <View accessibilityLiveRegion="polite" role="status" style={styles.requestStatus}>
        <Copy>{t('chatUnavailable')}</Copy>
      </View>}
      <View style={styles.inputActions}>
        <VoiceQuestion locale={locale} disabled={!!pending} onBusyChange={setVoiceBusy} onQuestion={(text) => {
          setQuestion(text);
          void send(text);
        }} />
        <Button label={t('send')} disabled={!!pending || voiceBusy || !question.trim()} onPress={() => void send()} />
      </View>
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
    <Copy>{t('entertainmentNotice')}</Copy>
  </Screen>;
}

const styles = StyleSheet.create({
  guide: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 53, height: 53, borderRadius: 27 },
  requestStatus: { marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  inputActions: { gap: 8 },
  action: { flex: 1 },
});

export default withIdentityScope(ChatScreenContent);
