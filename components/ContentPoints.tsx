import { useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, Checkbox, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContentPoint, Idea } from '../types';
import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { generateSpeakerPoints } from '../lib/gemini';

interface Props {
  idea: Idea;
  points: ContentPoint[];
  onPointsChange: (points: ContentPoint[]) => void;
}

export default function ContentPoints({ idea, points, onPointsChange }: Props) {
  const [newText, setNewText] = useState('');
  const [generating, setGenerating] = useState(false);

  const addPoint = async () => {
    if (!newText.trim()) return;
    const { data, error } = await supabase
      .from('content_points')
      .insert({ idea_id: idea.id, text: newText.trim(), sort_order: points.length })
      .select()
      .single();
    if (!error && data) {
      onPointsChange([...points, data as ContentPoint]);
      setNewText('');
    }
  };

  const togglePoint = async (point: ContentPoint) => {
    const { data, error } = await supabase
      .from('content_points')
      .update({ is_completed: !point.is_completed })
      .eq('id', point.id)
      .select()
      .single();
    if (!error && data) {
      onPointsChange(points.map(p => p.id === point.id ? data as ContentPoint : p));
    }
  };

  const deletePoint = async (pointId: string) => {
    await supabase.from('content_points').delete().eq('id', pointId);
    onPointsChange(points.filter(p => p.id !== pointId));
  };

  const generatePoints = async () => {
    setGenerating(true);
    try {
      const generated = await generateSpeakerPoints(idea);
      const newPoints = generated.map((text, i) => ({
        idea_id: idea.id,
        text,
        is_completed: false,
        ai_generated: true,
        sort_order: points.length + i,
      }));
      const { data, error } = await supabase
        .from('content_points')
        .insert(newPoints)
        .select();
      if (!error && data) onPointsChange([...points, ...(data as ContentPoint[])]);
    } catch (e) {
      console.error('Gemini error:', e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Content Points</Text>
        <Button
          mode="outlined"
          icon="auto-fix"
          onPress={generatePoints}
          loading={generating}
          disabled={generating}
          compact
          textColor={Colors.primary}
          style={styles.aiButton}
        >
          AI Generate
        </Button>
      </View>

      {points.length === 0 && !generating && (
        <Text style={styles.empty}>No points yet — add manually or use AI Generate</Text>
      )}

      {generating && (
        <View style={styles.generatingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.generatingText}>Gemini is drafting speaker points...</Text>
        </View>
      )}

      {points.map(point => (
        <View key={point.id} style={styles.pointRow}>
          <Checkbox
            status={point.is_completed ? 'checked' : 'unchecked'}
            onPress={() => togglePoint(point)}
            color={Colors.primary}
          />
          <Text
            style={[styles.pointText, point.is_completed && styles.strikethrough]}
            numberOfLines={4}
          >
            {point.text}
            {point.ai_generated && (
              <Text style={styles.aiTag}> ✦ AI</Text>
            )}
          </Text>
          <IconButton icon="close" size={16} onPress={() => deletePoint(point.id)} iconColor={Colors.textSecondary} />
        </View>
      ))}

      <View style={styles.inputRow}>
        <TextInput
          value={newText}
          onChangeText={setNewText}
          placeholder="Add a point to cover..."
          mode="outlined"
          style={styles.input}
          dense
          onSubmitEditing={addPoint}
          returnKeyType="done"
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
        />
        <IconButton icon="plus-circle" size={28} onPress={addPoint} iconColor={Colors.primary} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  aiButton: { borderColor: Colors.primary },
  empty: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: 12 },
  generatingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12, backgroundColor: Colors.background, borderRadius: 8 },
  generatingText: { fontSize: 13, color: Colors.textSecondary },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  pointText: { flex: 1, fontSize: 14, color: Colors.text, paddingTop: 10, lineHeight: 20 },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  aiTag: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: { flex: 1, fontSize: 14, backgroundColor: Colors.surface },
});
