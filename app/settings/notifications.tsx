import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Switch, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Platform, CommunityTag } from '../../types';
import { Colors } from '../../constants/colors';
import { PLATFORM_CONFIG, POSTING_SCHEDULES, getWeeklyBestTimes } from '../../lib/notifications';
import { COMMUNITY_CONFIG } from '../../lib/themes';

const TIMEZONES = [
  { label: 'Eastern (ET)',  value: 'America/New_York' },
  { label: 'Central (CT)', value: 'America/Chicago' },
  { label: 'Mountain (MT)',value: 'America/Denver' },
  { label: 'Pacific (PT)', value: 'America/Los_Angeles' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>(['youtube', 'instagram']);
  const [communities, setCommunities] = useState<CommunityTag[]>(['general']);
  const [timezone, setTimezone] = useState('America/New_York');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [engagementAlerts, setEngagementAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('notification_settings').select('*').limit(1).single()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          setPlatforms((data.platforms as Platform[]) ?? ['youtube', 'instagram']);
          setCommunities((data.communities as CommunityTag[]) ?? ['general']);
          setTimezone(data.timezone ?? 'America/New_York');
          setRemindersEnabled(data.reminders_enabled ?? true);
          setEngagementAlerts(data.engagement_alerts ?? true);
          setDeadlineAlerts(data.deadline_alerts ?? true);
        }
        setLoading(false);
      });
  }, []);

  const togglePlatform = (p: Platform) => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleCommunity = (c: CommunityTag) => setCommunities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const save = async () => {
    setSaving(true);
    const payload = {
      platforms, communities, timezone,
      reminders_enabled: remindersEnabled,
      engagement_alerts: engagementAlerts,
      deadline_alerts: deadlineAlerts,
    };
    if (settingsId) {
      await supabase.from('notification_settings').update(payload).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('notification_settings').insert(payload).select().single();
      if (data) setSettingsId(data.id);
    }
    setSaving(false);
  };

  const primaryPlatform = platforms[0];
  const primaryCommunity = communities.find(c => c !== 'general') ?? communities[0];
  const weeklyTimes = primaryPlatform
    ? getWeeklyBestTimes(primaryPlatform, primaryCommunity)
    : [];

  if (loading) return <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Notification Toggles */}
      <Text style={styles.sectionTitle}>Notification Types</Text>
      <View style={styles.card}>
        {[
          { label: 'Posting Reminders', sub: 'Alerts when your audience is most active', value: remindersEnabled, onChange: setRemindersEnabled, icon: 'bell-outline' },
          { label: 'Engagement Windows', sub: 'Best time to post for maximum reach', value: engagementAlerts, onChange: setEngagementAlerts, icon: 'chart-timeline-variant' },
          { label: 'Content Deadlines', sub: 'Tax season, open enrollment, cultural events', value: deadlineAlerts, onChange: setDeadlineAlerts, icon: 'calendar-alert' },
        ].map((item, i) => (
          <View key={item.label}>
            {i > 0 && <Divider />}
            <View style={styles.toggleRow}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} style={styles.toggleIcon} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Switch value={item.value} onValueChange={item.onChange} color={Colors.primary} />
            </View>
          </View>
        ))}
      </View>

      {/* Platforms */}
      <Text style={styles.sectionTitle}>Your Platforms</Text>
      <Text style={styles.sectionSub}>Select where you create content — insights will be tailored to these</Text>
      <View style={styles.chipGrid}>
        {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([key, config]) => (
          <View
            key={key}
            style={[styles.platformChip, platforms.includes(key) && { backgroundColor: config.color }]}
          >
            <Button
              compact
              mode={platforms.includes(key) ? 'contained' : 'outlined'}
              onPress={() => togglePlatform(key)}
              textColor={platforms.includes(key) ? '#FFF' : Colors.text}
              buttonColor={platforms.includes(key) ? config.color : undefined}
              style={styles.platformBtn}
              icon={() => <Text style={{ fontSize: 14 }}>{config.emoji}</Text>}
            >
              {config.label}
            </Button>
          </View>
        ))}
      </View>

      {/* Target Communities */}
      <Text style={styles.sectionTitle}>Target Communities</Text>
      <Text style={styles.sectionSub}>Posting time insights will be optimized for these audiences</Text>
      <View style={styles.chipGrid}>
        {(Object.entries(COMMUNITY_CONFIG) as [CommunityTag, typeof COMMUNITY_CONFIG[CommunityTag]][]).map(([key, config]) => (
          <Button
            key={key}
            compact
            mode={communities.includes(key) ? 'contained' : 'outlined'}
            onPress={() => toggleCommunity(key)}
            buttonColor={communities.includes(key) ? config.color : undefined}
            textColor={communities.includes(key) ? '#FFF' : Colors.text}
            style={styles.communityBtn}
          >
            {config.emoji} {config.label}
          </Button>
        ))}
      </View>

      {/* Weekly Schedule Preview */}
      {primaryPlatform && (
        <>
          <Text style={styles.sectionTitle}>
            Weekly Best Times · {PLATFORM_CONFIG[primaryPlatform].label}
            {primaryCommunity && primaryCommunity !== 'general' ? ` for ${COMMUNITY_CONFIG[primaryCommunity as CommunityTag]?.label}` : ''}
          </Text>
          <View style={styles.card}>
            {weeklyTimes.slice(0, 7).map(({ day, timeWindow, score }) => (
              <View key={day} style={styles.scheduleRow}>
                <View style={[styles.scoreDot, {
                  backgroundColor: score >= 80 ? Colors.status.executed : score >= 60 ? Colors.accent : Colors.border
                }]} />
                <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.timeLabel}>{score >= 50 ? timeWindow : '—'}</Text>
                <View style={[styles.scoreBar, { width: `${score}%` as any, backgroundColor: score >= 80 ? Colors.status.executed : score >= 60 ? Colors.accent : Colors.border }]} />
                <Text style={[styles.scoreText, { color: score >= 80 ? Colors.status.executed : score >= 60 ? Colors.accent : Colors.textSecondary }]}>
                  {score >= 80 ? '🔥 Best' : score >= 60 ? '✓ Good' : 'Low'}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Platform Tips */}
      {primaryPlatform && (
        <>
          <Text style={styles.sectionTitle}>Platform Strategy</Text>
          <View style={[styles.card, styles.tipCard]}>
            <Text style={styles.tipEmoji}>{PLATFORM_CONFIG[primaryPlatform].emoji}</Text>
            <Text style={styles.tipText}>{POSTING_SCHEDULES[primaryPlatform].tip}</Text>
          </View>
        </>
      )}

      <Button
        mode="contained"
        onPress={save}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
        buttonColor={Colors.primary}
        icon="content-save"
      >
        Save Settings
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 6 },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, overflow: 'hidden', elevation: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  toggleIcon: { marginRight: 12 },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  toggleSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformChip: { borderRadius: 20 },
  platformBtn: { borderRadius: 20 },
  communityBtn: { borderRadius: 20 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border + '60' },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  dayLabel: { width: 90, fontSize: 13, fontWeight: '600', color: Colors.text },
  timeLabel: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  scoreBar: { height: 4, borderRadius: 2, maxWidth: 60 },
  scoreText: { fontSize: 11, fontWeight: '700', width: 44, textAlign: 'right' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  tipEmoji: { fontSize: 24, marginTop: 2 },
  tipText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 19 },
  saveButton: { marginTop: 28, borderRadius: 10, paddingVertical: 4 },
});
