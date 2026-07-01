import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Idea, FinancialTheme } from '../../types';
import { Colors } from '../../constants/colors';
import { THEME_CONFIG, COMMUNITY_CONFIG } from '../../lib/themes';
import IdeaCard from '../../components/IdeaCard';

export default function ExploreScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<FinancialTheme | null>(null);

  useFocusEffect(useCallback(() => {
    supabase.from('ideas').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setIdeas(data as Idea[]); });
  }, []));

  const filtered = ideas.filter(idea => {
    const matchesSearch = !search || idea.title.toLowerCase().includes(search.toLowerCase()) || idea.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTheme = !selectedTheme || idea.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  const themeCounts = Object.keys(THEME_CONFIG).reduce<Record<string, number>>((acc, t) => {
    acc[t] = ideas.filter(i => i.theme === t).length;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search ideas..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        iconColor={Colors.primary}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
        <TouchableOpacity
          style={[styles.themeChip, !selectedTheme && styles.themeChipActive]}
          onPress={() => setSelectedTheme(null)}
        >
          <Text style={[styles.themeChipText, !selectedTheme && styles.themeChipTextActive]}>All</Text>
        </TouchableOpacity>
        {(Object.entries(THEME_CONFIG) as [FinancialTheme, typeof THEME_CONFIG[FinancialTheme]][]).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[styles.themeChip, selectedTheme === key && styles.themeChipActive, selectedTheme === key && { backgroundColor: config.color }]}
            onPress={() => setSelectedTheme(selectedTheme === key ? null : key)}
          >
            <MaterialCommunityIcons name={config.icon as any} size={13} color={selectedTheme === key ? '#FFF' : config.color} />
            <Text style={[styles.themeChipText, selectedTheme === key && styles.themeChipTextActive]}>
              {config.label}
            </Text>
            {themeCounts[key] > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{themeCounts[key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No ideas found</Text>
          <Text style={styles.emptyBody}>Try a different search or theme filter</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <IdeaCard idea={item} onPress={() => router.push(`/idea/${item.id}`)} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchbar: { margin: 12, backgroundColor: Colors.surface, elevation: 2 },
  themeRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  themeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.surface, borderRadius: 20, elevation: 1 },
  themeChipActive: { backgroundColor: Colors.primary },
  themeChipText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  themeChipTextActive: { color: '#FFFFFF' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 },
  countText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  list: { paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
