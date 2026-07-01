import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays } from 'date-fns';
import { HolidayEvent } from '../types';
import { Colors } from '../constants/colors';

const TYPE_ICON: Record<HolidayEvent['type'], string> = {
  financial: 'currency-usd',
  cultural: 'star-crescent',
  national: 'flag',
};

export default function HolidayBanner({ events }: { events: HolidayEvent[] }) {
  if (events.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upcoming Content Opportunities</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {events.map(event => {
          const daysAway = differenceInDays(parseISO(event.date), new Date());
          const color = Colors.eventType[event.type];
          return (
            <View key={event.name} style={[styles.card, { borderLeftColor: color }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={TYPE_ICON[event.type] as any} size={14} color={color} />
                <Text style={[styles.type, { color }]}>{event.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
              <Text style={styles.date}>{format(parseISO(event.date), 'MMM d')}</Text>
              <Text style={[styles.daysAway, { color }]}>
                {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d away`}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, paddingTop: 12, paddingBottom: 4, marginBottom: 4 },
  heading: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, paddingHorizontal: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  scroll: { paddingHorizontal: 12, gap: 10, paddingBottom: 12 },
  card: { width: 150, backgroundColor: Colors.background, borderRadius: 10, padding: 12, borderLeftWidth: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  type: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4, lineHeight: 17 },
  date: { fontSize: 12, color: Colors.textSecondary },
  daysAway: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});
