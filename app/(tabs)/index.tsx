import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, Chip, ActivityIndicator } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Idea, IdeaStatus, Platform, CommunityTag } from '../../types';
import { Colors } from '../../constants/colors';
import IdeaCard from '../../components/IdeaCard';
import HolidayBanner from '../../components/HolidayBanner';
import PostingInsightBanner from '../../components/PostingInsightBanner';
import { getUpcomingEvents } from '../../lib/holidays';
import { getTodayInsights } from '../../lib/notifications';

const FILTERS: { label: string; value: IdeaStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Executed', value: 'executed' },
];

export default function DashboardScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<IdeaStatus | 'all'>('all');
  const [platforms, setPlatforms] = useState<Platform[]>(['youtube', 'instagram']);
  const [communities, setCommunities] = useState<CommunityTag[]>(['hispanic_latino', 'general']);

  const load = async () => {
    const [{ data: ideasData }, { data: settingsData }] = await Promise.all([
      supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('notification_settings').select('*').limit(1).single(),
    ]);
    if (ideasData) setIdeas(ideasData as Idea[]);
    if (settingsData) {
      if (settingsData.platforms) setPlatforms(settingsData.platforms as Platform[]);
      if (settingsData.communities) setCommunities(settingsData.communities as CommunityTag[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.status === filter);
  const upcomingEvents = getUpcomingEvents(21);
  const todayInsights = getTodayInsights(platforms, communities);

  const stats = {
    draft: ideas.filter(i => i.status === 'draft').length,
    scheduled: ideas.filter(i => i.status === 'scheduled').length,
    in_progress: ideas.filter(i => i.status === 'in_progress').length,
    executed: ideas.filter(i => i.status === 'executed').length,
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View>
            {/* Posting Insight Banner */}
            <PostingInsightBanner
              insights={todayInsights}
              onSettingsPress={() => router.push('/settings/notifications')}
            />

            {/* Holiday / Content Calendar */}
            <HolidayBanner events={upcomingEvents.slice(0, 4)} />

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Draft',     count: stats.draft,       color: Colors.status.draft },
                { label: 'Scheduled', count: stats.scheduled,   color: Colors.status.scheduled },
                { label: 'Active',    count: stats.in_progress, color: Colors.status.in_progress },
                { label: 'Done',      count: stats.executed,    color: Colors.status.executed },
              ].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map(f => (
                <Chip
                  key={f.value}
                  selected={filter === f.value}
                  onPress={() => setFilter(f.value)}
                  style={styles.chip}
                  selectedColor={Colors.primary}
                  compact
                >
                  {f.label}
                </Chip>
              ))}
            </ScrollView>

            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No ideas yet</Text>
                <Text style={styles.emptyBody}>Tap + to capture your first financial literacy content idea</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <IdeaCard idea={item} onPress={() => router.push(`/idea/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/idea/new')} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, margin: 12,
    borderRadius: 12, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statCount: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  filterRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  chip: { marginRight: 2 },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', padding: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: Colors.primary },
});
