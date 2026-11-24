import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Copy } from '../../components/ui';
import { topics, type Topic } from './domain';

export function TopicPicker({ value, onSelect }: { value?: Topic; onSelect: (topic: Topic) => void }) {
  const { t } = useTranslation();

  return <>
    <Copy emphasis>{t('chooseTopic')}</Copy>
    <View style={styles.grid}>
      {topics.map((topic) => (
        <View key={topic} style={styles.item}>
          <Button label={t(topic)} secondary selected={value === topic} onPress={() => onSelect(topic)} />
        </View>
      ))}
    </View>
  </>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexBasis: '45%', flexGrow: 1 },
});
