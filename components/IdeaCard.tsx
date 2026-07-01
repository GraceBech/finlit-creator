import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Idea } from '../types';
import { Colors } from '../constants/colors';
import { THEME_CONFIG } from '../lib/themes';
import StatusBadge from './StatusBadge';

interface Props {
  idea: Idea;
  onPress: () => void;
}

export default function IdeaCard({ idea, onPress }: Props) {
  const themeConfig = idea.theme ? THEME_CONFIG[idea.theme] : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {themeConfig && (
                <MaterialCommunityIcons
                  name={themeConfig.icon as any}
                  size={16}
                  color={themeConfig.color}
                  style={styles.themeIcon}
                />
              )}
              <Text style={styles.title} numberOfLines={2}>{idea.title}</Text>
            </View>
            <StatusBadge status={idea.status} />
          </View>

          {idea.description ? (
            <Text style={styles.description} numberOfLines={2}>{idea.description}</Text>
          ) : null}

          <View style={styles.footer}>
            {themeConfig ? (
              <View style={[styles.themeTag, { backgroundColor: themeConfig.color + '18' }]}>
                <Text style={[styles.themeText, { color: themeConfig.color }]}>
                  {themeConfig.label}
                </Text>
              </View>
            ) : null}

            {idea.holiday_link ? (
              <View style={styles.holidayTag}>
                <MaterialCommunityIcons name="calendar-star" size={12} color={Colors.accent} />
                <Text style={styles.holidayText} numberOfLines={1}>{idea.holiday_link}</Text>
              </View>
            ) : null}

            {idea.scheduled_date ? (
              <View style={styles.dateTag}>
                <MaterialCommunityIcons name="calendar" size={12} color={Colors.textSecondary} />
                <Text style={styles.dateText}>{format(parseISO(idea.scheduled_date), 'MMM d')}</Text>
              </View>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 12, marginVertical: 5 },
  card: { backgroundColor: Colors.surface, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', marginRight: 8 },
  themeIcon: { marginTop: 2, marginRight: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  themeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  themeText: { fontSize: 11, fontWeight: '600' },
  holidayTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  holidayText: { fontSize: 11, color: Colors.accent, maxWidth: 120 },
  dateTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: 11, color: Colors.textSecondary },
});
