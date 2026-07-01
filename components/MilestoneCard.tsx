import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LifeStage, MilestoneProgress, MilestoneTopicStatus } from '../types';
import { Colors } from '../constants/colors';

const STATUS_CONFIG: Record<MilestoneTopicStatus, { label: string; color: string; icon: string }> = {
  not_started: { label: 'Not Started', color: Colors.status.draft,     icon: 'circle-outline' },
  in_progress: { label: 'In Progress', color: Colors.status.in_progress, icon: 'circle-half-full' },
  published:   { label: 'Published',   color: Colors.status.executed,   icon: 'check-circle' },
};

interface Props {
  stage: LifeStage;
  progress: MilestoneProgress[];
  onTopicPress: (stageId: string, topicId: string, currentStatus: MilestoneTopicStatus) => void;
  onCreateIdea: (stageId: string, topicId: string, topicTitle: string) => void;
}

export default function MilestoneCard({ stage, progress, onTopicPress, onCreateIdea }: Props) {
  const [expanded, setExpanded] = useState(false);

  const getTopicStatus = (topicId: string): MilestoneTopicStatus =>
    progress.find(p => p.stage_id === stage.id && p.topic_id === topicId)?.status ?? 'not_started';

  const publishedCount = stage.topics.filter(t => getTopicStatus(t.id) === 'published').length;
  const inProgressCount = stage.topics.filter(t => getTopicStatus(t.id) === 'in_progress').length;
  const total = stage.topics.length;
  const progressValue = (publishedCount + inProgressCount * 0.5) / total;

  return (
    <View style={[styles.card, { borderLeftColor: stage.color }]}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={[styles.iconBg, { backgroundColor: stage.color + '18' }]}>
            <MaterialCommunityIcons name={stage.icon as any} size={22} color={stage.color} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.emoji}>{stage.emoji}</Text>
              <Text style={styles.stageName}>{stage.name}</Text>
            </View>
            <Text style={styles.subtitle}>{stage.subtitle} · {stage.timeline}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.count, { color: stage.color }]}>
              {publishedCount}/{total}
            </Text>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.progressRow}>
          <ProgressBar
            progress={progressValue}
            color={stage.color}
            style={styles.progressBar}
          />
          <Text style={styles.progressLabel}>
            {publishedCount} published · {inProgressCount} in progress
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.topicsContainer}>
          <Text style={styles.description}>{stage.description}</Text>

          {stage.topics.map(topic => {
            const status = getTopicStatus(topic.id);
            const statusConfig = STATUS_CONFIG[status];
            return (
              <View key={topic.id} style={styles.topicRow}>
                <TouchableOpacity
                  style={styles.topicStatus}
                  onPress={() => onTopicPress(stage.id, topic.id, status)}
                >
                  <MaterialCommunityIcons
                    name={statusConfig.icon as any}
                    size={20}
                    color={statusConfig.color}
                  />
                </TouchableOpacity>

                <View style={styles.topicContent}>
                  <Text style={[styles.topicTitle, status === 'published' && styles.strikethrough]}>
                    {topic.title}
                  </Text>
                  <Text style={styles.topicDesc} numberOfLines={2}>{topic.description}</Text>

                  <View style={styles.topicMeta}>
                    {topic.priority === 'high' && (
                      <View style={styles.priorityTag}>
                        <Text style={styles.priorityText}>🔥 Priority</Text>
                      </View>
                    )}
                    {topic.visaTypes && (
                      <Text style={styles.visaTag}>{topic.visaTypes.join(' · ')}</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => onCreateIdea(stage.id, topic.id, topic.title)}
                >
                  <MaterialCommunityIcons name="plus-circle-outline" size={20} color={stage.color} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 8 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 16 },
  stageName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  count: { fontSize: 13, fontWeight: '700' },
  progressRow: { paddingHorizontal: 14, paddingBottom: 14 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.border },
  progressLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  topicsContainer: { borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, lineHeight: 18, fontStyle: 'italic' },
  topicRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border + '80' },
  topicStatus: { marginTop: 2, marginRight: 10 },
  topicContent: { flex: 1 },
  topicTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, lineHeight: 18 },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  topicDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 16 },
  topicMeta: { flexDirection: 'row', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  priorityTag: { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontSize: 10, color: '#E65100', fontWeight: '600' },
  visaTag: { fontSize: 10, color: Colors.textSecondary, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  createBtn: { marginLeft: 8, marginTop: 2 },
});
