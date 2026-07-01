import { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { FinancialTheme, CommunityTag } from '../../types';
import { Colors } from '../../constants/colors';
import { THEME_CONFIG, COMMUNITY_CONFIG } from '../../lib/themes';
import { suggestHolidayForIdea } from '../../lib/holidays';

export default function NewIdeaScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<FinancialTheme | null>(null);
  const [communities, setCommunities] = useState<CommunityTag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleCommunity = (tag: CommunityTag) => {
    setCommunities(prev =>
      prev.includes(tag) ? prev.filter(c => c !== tag) : [...prev, tag]
    );
  };

  const holidaySuggestion = title.length > 3 ? suggestHolidayForIdea(title, description) : null;

  const save = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    const { error: dbError } = await supabase.from('ideas').insert({
      title: title.trim(),
      description: description.trim() || null,
      theme: theme ?? null,
      community_tags: communities.length > 0 ? communities : null,
      status: 'draft',
      holiday_link: holidaySuggestion?.name ?? null,
    });
    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Content Idea *</Text>
        <TextInput
          value={title}
          onChangeText={t => { setTitle(t); setError(''); }}
          placeholder="e.g. How to open a bank account without a SSN"
          mode="outlined"
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          autoFocus
        />
        <HelperText type="error" visible={!!error}>{error}</HelperText>

        {holidaySuggestion && (
          <View style={styles.suggestionBanner}>
            <MaterialCommunityIcons name="calendar-star" size={16} color={Colors.accent} />
            <Text style={styles.suggestionText}>
              Suggested tie-in: <Text style={styles.suggestionBold}>{holidaySuggestion.name}</Text> ({holidaySuggestion.date})
            </Text>
          </View>
        )}

        <Text style={styles.label}>Description / Notes</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Brief outline or any quick notes..."
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
        />

        <Text style={styles.label}>Financial Theme</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {(Object.entries(THEME_CONFIG) as [FinancialTheme, typeof THEME_CONFIG[FinancialTheme]][]).map(([key, config]) => (
            <Chip
              key={key}
              selected={theme === key}
              onPress={() => setTheme(theme === key ? null : key)}
              style={[styles.chip, theme === key && { backgroundColor: config.color }]}
              textStyle={theme === key ? { color: '#FFFFFF' } : { color: Colors.text }}
              icon={() => <MaterialCommunityIcons name={config.icon as any} size={14} color={theme === key ? '#FFF' : config.color} />}
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
              textStyle={communities.includes(key) ? { color: '#FFF' } : { color: Colors.text }}
              compact
            >
              {config.emoji} {config.label}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={save}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          buttonColor={Colors.primary}
          icon="content-save"
        >
          Save Idea
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.surface },
  suggestionBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12, marginTop: 6, borderWidth: 1, borderColor: Colors.accentLight },
  suggestionText: { flex: 1, fontSize: 13, color: Colors.text },
  suggestionBold: { fontWeight: '700', color: Colors.accent },
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: { marginRight: 4 },
  communityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  communityChip: {},
  saveButton: { marginTop: 28, borderRadius: 10, paddingVertical: 4 },
});
