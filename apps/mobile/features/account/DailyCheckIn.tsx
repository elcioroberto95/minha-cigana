import { withIdentityScope } from '../../lib/identity-scope';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Copy, Panel, colors } from '../../components/ui';
import { checkInTopics, moods, offerCheckIn, saveCheckIn, type CheckIn } from './profile-api';

const saoPauloDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
});

function DailyCheckInContent() {
  const [offeredDate, setOfferedDate] = useState<string>();

  useEffect(() => {
    let mounted = true;
    let busy = false;
    let checkedDay: string | undefined;

    async function check() {
      const day = saoPauloDay.format();
      if (busy || checkedDay === day || (AppState.currentState && AppState.currentState !== 'active')) return;
      busy = true;
      try {
        const offer = await offerCheckIn();
        if (!mounted) return;
        checkedDay = day;
        setOfferedDate(offer.show ? offer.date : undefined);
      } catch {
        // Uma falha de rede não impede a pessoa de usar o app.
      } finally {
        busy = false;
      }
    }

    void check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    const timer = setInterval(() => void check(), 60_000);
    return () => {
      mounted = false;
      subscription.remove();
      clearInterval(timer);
    };
  }, []);

  return offeredDate && <CheckInDialog key={offeredDate} date={offeredDate} onClose={() => setOfferedDate((current) => current === offeredDate ? undefined : current)} />;
}

function CheckInDialog({ date, onClose }: { date: string; onClose: () => void }) {
  const { t } = useTranslation();
  const [mood, setMood] = useState<CheckIn['mood']>();
  const [topic, setTopic] = useState<CheckIn['topic']>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save() {
    if (!mood || !topic || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await saveCheckIn({ date, mood, topic });
      onClose();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  return <Modal transparent animationType="fade" onRequestClose={() => { if (!saving) onClose(); }}>
    <View style={styles.overlay} accessibilityViewIsModal>
      <ScrollView style={styles.dialog} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
        <Panel>
          <Copy emphasis>{t('checkInMood')}</Copy>
          <View style={styles.options}>
            {moods.map((item) => <Button key={item} label={t(item)} secondary selected={mood === item}
              disabled={saving} onPress={() => setMood(item)} />)}
          </View>
          <Copy emphasis>{t('checkInTopic')}</Copy>
          <View style={styles.options}>
            {checkInTopics.map((item) => <Button key={item} label={t(item)} secondary selected={topic === item}
              disabled={saving} onPress={() => setTopic(item)} />)}
          </View>
          <Copy>{t('checkInNotice')}</Copy>
          {failed && <View accessibilityLiveRegion="polite"><Copy>{t('profileSaveError')}</Copy></View>}
          <Button label={t('saveCheckIn')} disabled={!mood || !topic || saving} onPress={() => void save()} />
          <Button label={t('skipCheckIn')} disabled={saving} secondary onPress={onClose} />
        </Panel>
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#160D25DC', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { flexGrow: 0, maxWidth: 480, width: '100%', borderRadius: 18, backgroundColor: colors.surface },
  content: { flexGrow: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

export const DailyCheckIn = withIdentityScope(DailyCheckInContent);
