import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MilestoneProgress, MilestoneTopicStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { LIFE_STAGES, getTotalTopics } from '../../lib/milestones';
import MilestoneCard from '../../components/MilestoneCard';

export default function MilestonesScreen() {
  const [progress, setProgress] = useState<MilestoneProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    supabase.from('milestone_progress').select('*')
      .then(({ data }) => { if (data) setProgress(data as MilestoneProgress[]); setLoading(false); });
  }, []));

  const cycleTopicStatus = async (stageId: string, topicId: string, current: MilestoneTopicStatus) => {
    const CYCLE: MilestoneTopicStatus[] = ['not_started', 'in_progress', 'published'];
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

    const existing = progress.find(p => p.stage_id === stageId && p.topic_id === topicId);

    if (existing) {
      const { data } = await supabase
        .from('milestone_progress')
        .update({ status: next })
        .eq('id', existing.id)
        .select()
        .single();
      if (data) {
        setProgress(prev => prev.map(p => p.id === existing.id ? data as MilestoneProgress : p));
      }
    } else {
      const { data } = await supabase
        .from('milestone_progress')
        .insert({ stage_id: stageId, topic_id: topicId, status: next })
        .select()
        .single();
      if (data) setProgress(prev => [...prev, data as MilestoneProgress]);
    }
  };

  const createIdeaForTopic = (stageId: string, topicId: string, topicTitle: string) => {
    router.push({
      pathname: '/idea/new',
      params: { prefillTitle: topicTitle, milestoneStageId: stageId, milestoneTopicId: topicId },
    });
  };

  const totalTopics = getTotalTopics();
  const publishedTotal = progress.filter(p => p.status === 'published').length;
  const inProgressTotal = progress.filter(p => p.status === 'in_progress').length;
  const overallProgress = (publishedTotal + inProgressTotal * 0.5) / totalTopics;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <FlatList
      style={styles.container}
      data={LIFE_STAGES}
      keyExtractor={s => s.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Immigrant Financial Journey</Text>
            <Text style={styles.headerSub}>
              {publishedTotal} of {totalTopics} topics published · {inProgressTotal} in progress
            </Text>
            <ProgressBar
              progress={overallProgress}
              color={Colors.primary}
              style={styles.overallProgress}
            />

            <View style={styles.stageGrid}>
              {[
                { label: 'Life Stages', value: LIFE_STAGES.length.toString(), color: Colors.primary },
                { label: 'Total Topics', value: totalTopics.toString(), color: Colors.accent },
                { label: 'Published', value: publishedTotal.toString(), color: Colors.status.executed },
                { label: 'In Progress', value: inProgressTotal.toString(), color: Colors.status.in_progress },
              ].map(s => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.hint}>
              Tap a stage to expand · Tap ○ to cycle status · Tap + to create an idea
            </Text>
          </View>
        </View>
      }
      renderItem={({ item: stage }) => (
        <MilestoneCard
          stage={stage}
          progress={progress}
          onTopicPress={cycleTopicStatus}
          onCreateIdea={createIdeaForTopic}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 12 },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  overallProgress: { height: 8, borderRadius: 4, backgroundColor: Colors.border, marginBottom: 16 },
  stageGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  hint: { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  list: { paddingBottom: 40 },
});
