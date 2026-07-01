import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { PostingInsight, Platform } from '../types';
import { Colors } from '../constants/colors';
import { PLATFORM_CONFIG, getContentReminders } from '../lib/notifications';

interface Props {
  insights: PostingInsight[];
  onSettingsPress: () => void;
}

export default function PostingInsightBanner({ insights, onSettingsPress }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const reminders = getContentReminders();
  const now = new Date();
  const dayName = format(now, 'EEEE');

  if (dismissed) return null;

  const topReminder = reminders[0];
  const hasInsights = insights.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="bell-ring" size={16} color={Colors.accent} />
          <Text style={styles.headerTitle}>Creator Insights · {dayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onSettingsPress} style={styles.settingsBtn}>
            <MaterialCommunityIcons name="cog-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDismissed(true)}>
            <MaterialCommunityIcons name="close" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Best Posting Times */}
      {hasInsights && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BEST TIME TO POST TODAY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightRow}>
            {insights.map((insight, i) => {
              const platform = PLATFORM_CONFIG[insight.platform];
              const isNow = isCurrentlyGoodTime(insight);
              return (
                <View key={i} style={[styles.insightCard, isNow && styles.insightCardActive]}>
                  <View style={styles.insightTop}>
                    <Text style={styles.platformEmoji}>{platform.emoji}</Text>
                    <Text style={[styles.platformName, { color: platform.color }]}>{platform.label}</Text>
                    {isNow && (
                      <View style={styles.nowBadge}>
                        <Text style={styles.nowText}>NOW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timeWindow}>{insight.timeWindow}</Text>
                  <Text style={styles.insightTip} numberOfLines={2}>{insight.tip}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {!hasInsights && (
        <View style={styles.noInsightRow}>
          <MaterialCommunityIcons name="calendar-check" size={16} color={Colors.textSecondary} />
          <Text style={styles.noInsightText}>No peak posting times today for your platforms. Rest or plan ahead!</Text>
        </View>
      )}

      {/* Content Reminder */}
      {topReminder && (
        <View style={[styles.reminderRow, topReminder.urgency === 'high' && styles.reminderHigh]}>
          <MaterialCommunityIcons
            name={topReminder.urgency === 'high' ? 'alert-circle' : 'lightbulb-outline'}
            size={14}
            color={topReminder.urgency === 'high' ? '#C62828' : Colors.accent}
          />
          <Text style={[styles.reminderText, topReminder.urgency === 'high' && styles.reminderTextHigh]} numberOfLines={3}>
            {topReminder.message}
          </Text>
        </View>
      )}
    </View>
  );
}

function isCurrentlyGoodTime(insight: PostingInsight): boolean {
  const now = new Date();
  const hour = now.getHours();
  // Parse the timeWindow string to check if current hour overlaps
  // Simple heuristic: if window contains current hour format
  const hourStr = hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
  return insight.timeWindow.includes(hourStr) ||
    insight.timeWindow.includes(`${hour < 12 ? hour : hour - 12}`);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.accent + '10',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  settingsBtn: {},
  section: { paddingTop: 8 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 0.8, paddingHorizontal: 14, marginBottom: 8,
  },
  insightRow: { paddingHorizontal: 12, gap: 10, paddingBottom: 12 },
  insightCard: {
    width: 160, backgroundColor: Colors.background, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  insightCardActive: { borderColor: Colors.accent, backgroundColor: '#FFF8E1' },
  insightTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  platformEmoji: { fontSize: 14 },
  platformName: { fontSize: 12, fontWeight: '700', flex: 1 },
  nowBadge: { backgroundColor: Colors.accent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  nowText: { fontSize: 9, color: '#FFF', fontWeight: '800' },
  timeWindow: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  insightTip: { fontSize: 11, color: Colors.textSecondary, lineHeight: 15 },
  noInsightRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  noInsightText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  reminderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#FFF8E1', borderTopWidth: 1, borderTopColor: Colors.border,
  },
  reminderHigh: { backgroundColor: '#FFEBEE' },
  reminderText: { flex: 1, fontSize: 12, color: Colors.text, lineHeight: 17 },
  reminderTextHigh: { color: '#C62828' },
});
