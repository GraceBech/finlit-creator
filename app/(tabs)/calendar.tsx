import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Idea } from '../../types';
import { Colors } from '../../constants/colors';
import { buildCalendarMarkers, getEventsForDate } from '../../lib/holidays';
import StatusBadge from '../../components/StatusBadge';

export default function CalendarScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    supabase.from('ideas').select('*').not('scheduled_date', 'is', null)
      .then(({ data }) => { if (data) setIdeas(data as Idea[]); setLoading(false); });
  }, []));

  const ideaMarkers = ideas.reduce<Record<string, { dots: Array<{ key: string; color: string }> }>>((acc, idea) => {
    if (!idea.scheduled_date) return acc;
    if (!acc[idea.scheduled_date]) acc[idea.scheduled_date] = { dots: [] };
    const color = Colors.status[idea.status];
    acc[idea.scheduled_date].dots.push({ key: idea.id, color });
    return acc;
  }, {});

  const holidayMarkers = buildCalendarMarkers();
  const mergedMarkers: typeof ideaMarkers = {};

  for (const date of Array.from(new Set([...Object.keys(ideaMarkers), ...Object.keys(holidayMarkers)]))) {
    mergedMarkers[date] = { dots: [...(ideaMarkers[date]?.dots ?? []), ...(holidayMarkers[date]?.dots ?? [])] };
  }

  if (selected) {
    mergedMarkers[selected] = {
      ...mergedMarkers[selected],
      dots: mergedMarkers[selected]?.dots ?? [],
    };
  }

  const selectedIdeas = ideas.filter(i => i.scheduled_date === selected);
  const selectedEvents = getEventsForDate(selected);

  const markedDates: Record<string, any> = {};
  for (const [date, val] of Object.entries(mergedMarkers)) {
    markedDates[date] = { ...val, selected: date === selected, selectedColor: Colors.primaryLight };
  }
  if (!markedDates[selected]) {
    markedDates[selected] = { selected: true, selectedColor: Colors.primaryLight, dots: [] };
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: { dateString: string }) => setSelected(day.dateString)}
        theme={{
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.accent,
          arrowColor: Colors.primary,
          dotColor: Colors.primary,
          selectedDotColor: '#FFFFFF',
        }}
      />

      <View style={styles.legend}>
        {[
          { color: Colors.status.draft, label: 'Draft' },
          { color: Colors.status.scheduled, label: 'Scheduled' },
          { color: Colors.status.in_progress, label: 'Active' },
          { color: Colors.status.executed, label: 'Done' },
          { color: Colors.eventType.financial, label: 'Financial' },
          { color: Colors.eventType.cultural, label: 'Cultural' },
          { color: Colors.eventType.national, label: 'Holiday' },
        ].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendLabel}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dayPanel}>
        <Text style={styles.dayTitle}>{format(parseISO(selected), 'MMMM d, yyyy')}</Text>

        {selectedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Events & Opportunities</Text>
            {selectedEvents.map(event => (
              <View key={event.name} style={[styles.eventRow, { borderLeftColor: Colors.eventType[event.type] }]}>
                <Text style={styles.eventName}>{event.name}</Text>
                {event.description ? <Text style={styles.eventDesc}>{event.description}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {selectedIdeas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Scheduled Content</Text>
            {selectedIdeas.map(idea => (
              <View key={idea.id} style={styles.ideaRow} onTouchEnd={() => router.push(`/idea/${idea.id}`)}>
                <View style={styles.ideaRowLeft}>
                  <Text style={styles.ideaTitle}>{idea.title}</Text>
                  {idea.theme ? <Text style={styles.ideaTheme}>{idea.theme.replace(/_/g, ' ')}</Text> : null}
                </View>
                <StatusBadge status={idea.status} />
              </View>
            ))}
          </View>
        )}

        {selectedIdeas.length === 0 && selectedEvents.length === 0 && (
          <Text style={styles.nothingText}>Nothing scheduled. Tap an idea to assign it this date.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12, backgroundColor: Colors.surface },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },
  dayPanel: { margin: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, elevation: 2 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  eventRow: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 8 },
  eventName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  eventDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  ideaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  ideaRowLeft: { flex: 1, marginRight: 8 },
  ideaTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  ideaTheme: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  nothingText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
});
