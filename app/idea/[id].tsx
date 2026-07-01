import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, Menu, IconButton, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Idea, ContentPoint, AIMessage, IdeaStatus, FinancialTheme, CommunityTag } from '../../types';
import { Colors } from '../../constants/colors';
import { THEME_CONFIG, COMMUNITY_CONFIG } from '../../lib/themes';
import { suggestHolidayForIdea } from '../../lib/holidays';
import ContentPoints from '../../components/ContentPoints';
import AIChat from '../../components/AIChat';
import StatusBadge from '../../components/StatusBadge';

const STATUS_CYCLE: IdeaStatus[] = ['draft', 'scheduled', 'in_progress', 'executed'];

type Tab = 'details' | 'points' | 'ai';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [points, setPoints] = useState<ContentPoint[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [tab, setTab] = useState<Tab>('details');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<FinancialTheme | null>(null);
  const [communities, setCommunities] = useState<CommunityTag[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    const [{ data: ideaData }, { data: pointsData }, { data: msgsData }] = await Promise.all([
      supabase.from('ideas').select('*').eq('id', id).single(),
      supabase.from('content_points').select('*').eq('idea_id', id).order('sort_order'),
      supabase.from('ai_messages').select('*').eq('idea_id', id).order('created_at'),
    ]);
    if (ideaData) {
      const i = ideaData as Idea;
      setIdea(i);
      setTitle(i.title);
      setDescription(i.description ?? '');
      setTheme((i.theme as FinancialTheme) ?? null);
      setCommunities((i.community_tags as CommunityTag[]) ?? []);
      setScheduledDate(i.scheduled_date ? parseISO(i.scheduled_date) : null);
      navigation.setOptions({ title: i.title });
    }
    if (pointsData) setPoints(pointsData as ContentPoint[]);
    if (msgsData) setMessages(msgsData as AIMessage[]);
    setLoading(false);
  };

  const save = async () => {
    if (!idea || !title.trim()) return;
    setSaving(true);
    const holidaySuggestion = suggestHolidayForIdea(title, description);
    const { data } = await supabase.from('ideas').update({
      title: title.trim(),
      description: description.trim() || null,
      theme: theme ?? null,
      community_tags: communities.length > 0 ? communities : null,
      scheduled_date: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : null,
      holiday_link: idea.holiday_link ?? holidaySuggestion?.name ?? null,
    }).eq('id', idea.id).select().single();
    if (data) setIdea(data as Idea);
    setSaving(false);
  };

  const cycleStatus = async () => {
    if (!idea) return;
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(idea.status) + 1) % STATUS_CYCLE.length];
    const { data } = await supabase.from('ideas').update({ status: nextStatus }).eq('id', idea.id).select().single();
    if (data) setIdea(data as Idea);
  };

  const deleteIdea = () => {
    Alert.alert('Delete Idea', 'This will permanently delete the idea and all its content points.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('ideas').delete().eq('id', id);
          router.back();
        },
      },
    ]);
  };

  const toggleCommunity = (tag: CommunityTag) => {
    setCommunities(prev => prev.includes(tag) ? prev.filter(c => c !== tag) : [...prev, tag]);
  };

  if (loading || !idea) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Button mode="outlined" compact onPress={cycleStatus} textColor={Colors.status[idea.status]} style={{ borderColor: Colors.status[idea.status] }}>
          {idea.status.replace('_', ' ').toUpperCase()} →
        </Button>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
        >
          <Menu.Item leadingIcon="delete" onPress={() => { setMenuVisible(false); deleteIdea(); }} title="Delete Idea" titleStyle={{ color: '#B71C1C' }} />
        </Menu>
      </View>

      {/* Tabs */}
      <SegmentedButtons
        value={tab}
        onValueChange={v => setTab(v as Tab)}
        buttons={[
          { value: 'details', label: 'Details', icon: 'pencil' },
          { value: 'points', label: `Points (${points.length})`, icon: 'format-list-checks' },
          { value: 'ai', label: 'AI Chat', icon: 'robot-outline' },
        ]}
        style={styles.tabs}
        theme={{ colors: { secondaryContainer: Colors.primaryLight + '22', onSecondaryContainer: Colors.primary } }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* DETAILS TAB */}
        {tab === 'details' && (
          <View>
            <Text style={styles.label}>Title</Text>
            <TextInput value={title} onChangeText={setTitle} mode="outlined" style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} />

            <Text style={styles.label}>Description / Notes</Text>
            <TextInput value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.primary} placeholder="Context, angle, hook ideas..." />

            <Text style={styles.label}>Publish Date</Text>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
              textColor={scheduledDate ? Colors.primary : Colors.textSecondary}
            >
              {scheduledDate ? format(scheduledDate, 'MMMM d, yyyy') : 'Set a date'}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate ?? new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(_, date) => { setShowDatePicker(false); if (date) setScheduledDate(date); }}
              />
            )}

            {idea.holiday_link && (
              <View style={styles.holidayPill}>
                <MaterialCommunityIcons name="calendar-star" size={14} color={Colors.accent} />
                <Text style={styles.holidayText}>{idea.holiday_link}</Text>
              </View>
            )}

            <Text style={styles.label}>Financial Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(Object.entries(THEME_CONFIG) as [FinancialTheme, typeof THEME_CONFIG[FinancialTheme]][]).map(([key, config]) => (
                <Chip
                  key={key}
                  selected={theme === key}
                  onPress={() => setTheme(theme === key ? null : key)}
                  style={[styles.chip, theme === key && { backgroundColor: config.color }]}
                  textStyle={theme === key ? { color: '#FFF' } : {}}
                  icon={() => <MaterialCommunityIcons name={config.icon as any} size={13} color={theme === key ? '#FFF' : config.color} />}
                  compact
                >
                  {config.label}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.label}>Target Community</Text>
            <View style={styles.communityGrid}>
              {(Object.entries(COMMUNITY_CONFIG) as [CommunityTag, typeof COMMUNITY_CONFIG[CommunityTag]][]).map(([key, config]) => (
                <Chip
                  key={key}
                  selected={communities.includes(key)}
                  onPress={() => toggleCommunity(key)}
                  style={[styles.communityChip, communities.includes(key) && { backgroundColor: config.color }]}
                  textStyle={communities.includes(key) ? { color: '#FFF' } : {}}
                  compact
                >
                  {config.emoji} {config.label}
                </Chip>
              ))}
            </View>

            <Button mode="contained" onPress={save} loading={saving} disabled={saving} style={styles.saveButton} buttonColor={Colors.primary} icon="content-save">
              Save Changes
            </Button>
          </View>
        )}

        {/* POINTS TAB */}
        {tab === 'points' && (
          <ContentPoints idea={idea} points={points} onPointsChange={setPoints} />
        )}

        {/* AI CHAT TAB */}
        {tab === 'ai' && (
          <AIChat idea={idea} messages={messages} onMessagesChange={setMessages} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabs: { margin: 12 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.surface },
  dateButton: { borderColor: Colors.border, justifyContent: 'flex-start' },
  holidayPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 8 },
  holidayText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: { marginRight: 4 },
  communityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  communityChip: {},
  saveButton: { marginTop: 24, borderRadius: 10, paddingVertical: 4 },
});
