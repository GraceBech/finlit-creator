import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { IdeaStatus } from '../types';
import { Colors } from '../constants/colors';

const LABEL: Record<IdeaStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  executed: 'Executed',
};

export default function StatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: Colors.statusBg[status] }]}>
      <Text style={[styles.text, { color: Colors.status[status] }]}>
        {LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
