import { withIdentityScope } from '../../lib/identity-scope';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, colors, Copy, Field, Panel, Screen, Title } from '../../components/ui';
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
  const [showOptions, setShowOptions] = useState(false);
  const [replyMode, setReplyMode] = useState<'text' | 'audio'>('text');
  const locale = i18n.resolvedLanguage === 'en-US' ? 'en-US' : 'pt-BR';
  const playback = useSpeechPlayback(locale);
  const repliedIn = useRef(false);
  const [savedLength, setSavedLength] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const sessionId = useRef<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem('cigana.reply-mode').then((mode) => {
      if (mounted && !repliedIn.current && mode === 'audio') setReplyMode('audio');
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!history.length && !pending) return;
    const frame = requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [history.length, pending]);

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
    playback.stop();
    setShowOptions(false);
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

  const composer = <View style={styles.composer}>
    <View style={styles.composerContent}>
      {failed && <View accessibilityLiveRegion="polite" role="status"><Copy>{t('chatUnavailable')}</Copy></View>}
      {!voiceBusy && <Field label={t('question')} placeholder={t('chatInputHint')} placeholderTextColor={colors.muted}
        hideLabel value={question} onChangeText={setQuestion} editable={!pending} multiline maxLength={500} style={styles.question} />}
      <View style={styles.actions}>
        <View style={styles.action}>
          <VoiceQuestion locale={locale} disabled={!!pending} onBusyChange={setVoiceBusy} onQuestion={(text) => {
            setQuestion(text);
            void send(text);
          }} />
        </View>
        {!voiceBusy && <View style={styles.action}><Button label={t('send')} disabled={!!pending || !question.trim()}
          onPress={() => void send()} /></View>}
      </View>
    </View>
  </View>;

  return <Screen scrollRef={scroll} footer={composer}>
    <Title>{t('chat')}</Title>
    <View style={styles.guide}>
      <View style={styles.identity}>
        <Image source={portrait} style={styles.avatar} accessibilityLabel={t('portrait')} />
        <View style={styles.identityText}>
          <Copy emphasis>Madame Esmeralda</Copy>
          <Text style={styles.meta}>{t(topic)} · {t(replyMode === 'audio' ? 'replyAudio' : 'replyText')}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" aria-expanded={showOptions} onPress={() => setShowOptions(!showOptions)} style={styles.inlineButton}>
        <Text style={styles.inlineLabel}>{t('chatOptions')} {showOptions ? '⌃' : '⌄'}</Text>
      </Pressable>
    </View>
    {showOptions && <Panel>
      {!drawId && <TopicPicker value={topic} onSelect={setTopic} />}
      <Copy emphasis>{t('replyMode')}</Copy>
      <View style={styles.actions}>
        <View style={styles.action}><Button label={t('replyText')} secondary selected={replyMode === 'text'} disabled={!!pending} onPress={() => changeReplyMode('text')} /></View>
        <View style={styles.action}><Button label={t('replyAudio')} secondary selected={replyMode === 'audio'} disabled={!!pending} onPress={() => changeReplyMode('audio')} /></View>
      </View>
      {history.length > 0 && <>
        <Copy>{t(history.length > savedMessageLimit ? 'conversationTooLong' : 'saveConversationPrivacy')}</Copy>
        <Button label={t(history.length === savedLength ? 'conversationSaved' : 'saveConversation')} secondary
          disabled={!!pending || saveStatus === 'saving' || history.length === savedLength || history.length > savedMessageLimit}
          onPress={() => void save()} />
        {saveStatus === 'saving' && <Copy>{t('savingConversation')}</Copy>}
        {saveStatus === 'error' && <Copy>{t('saveConversationError')}</Copy>}
      </>}
      <Button label={t('threeCards')} secondary onPress={() => router.push({
        pathname: '/leituras/beta', params: { topic, from: 'chat' },
      })} />
      <Copy>{t('entertainmentNotice')}</Copy>
    </Panel>}
    {dailyCardId && <Copy>{t('dailyChatContext')}</Copy>}
    {drawId && <Copy>{t('spreadChatContext')}</Copy>}
    {!history.length && !pending && <View style={styles.bubble}><Copy>{t('chatWelcome')}</Copy></View>}
    {history.map(({ role, content }, index) => <View key={index} style={[styles.bubble, role === 'user' && styles.userBubble]}>
      <Text accessibilityLabel={(role === 'assistant' ? 'Madame Esmeralda' : t('chatYou')) + ' · ' + content} style={styles.message}>{content}</Text>
      {role === 'assistant' && index === history.length - 1 && <>
        <Pressable accessibilityRole="button" disabled={voiceBusy || !!pending} style={styles.listen}
          onPress={() => playback.speaking ? playback.stop() : playback.speak(content)}>
          <Text style={styles.inlineLabel}>{t(playback.preparing ? 'speechPreparing' : playback.speaking ? 'stopSpeech' : 'listenSpeech')}</Text>
        </Pressable>
        {playback.speechFailed && <Copy>{t('speechPlaybackError')}</Copy>}
      </>}
    </View>)}
    {!!pending && <>
      <View style={[styles.bubble, styles.userBubble]}><Text accessibilityLabel={t('chatYou') + ' · ' + pending} style={styles.message}>{pending}</Text></View>
      <RitualLoader label={t('chatThinking')} mode="consultation" />
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  guide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  identityText: { flexShrink: 1 },
  avatar: { width: 43, height: 43, borderRadius: 22, borderColor: colors.gold, borderWidth: 1 },
  meta: { color: colors.muted, fontFamily: 'DMSans_400Regular', fontSize: 12 },
  inlineButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  inlineLabel: { color: colors.cream, fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  bubble: { alignSelf: 'flex-start', maxWidth: '93%', padding: 14, borderRadius: 17, borderBottomLeftRadius: 5,
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.selected, borderBottomLeftRadius: 17, borderBottomRightRadius: 5 },
  message: { color: colors.text, fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 23 },
  listen: { minHeight: 42, alignSelf: 'flex-start', justifyContent: 'center' },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 22, paddingVertical: 10, backgroundColor: colors.background },
  composerContent: { width: '100%', maxWidth: 540, alignSelf: 'center', gap: 8 },
  question: { minHeight: 58, maxHeight: 126 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1 },
});

export default withIdentityScope(ChatScreenContent);
