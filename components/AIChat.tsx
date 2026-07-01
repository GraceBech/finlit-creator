import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Idea, AIMessage, FinancialTheme } from '../types';
import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { sendChat } from '../lib/gemini';
import { SUGGESTED_PROMPTS } from '../lib/themes';

interface Props {
  idea: Idea;
  messages: AIMessage[];
  onMessagesChange: (messages: AIMessage[]) => void;
}

export default function AIChat({ idea, messages, onMessagesChange }: Props) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    setSending(true);

    const userMsg: Omit<AIMessage, 'id' | 'created_at'> = { idea_id: idea.id, role: 'user', content: trimmed };
    const { data: savedUser } = await supabase.from('ai_messages').insert(userMsg).select().single();
    const updatedMessages = [...messages, savedUser as AIMessage];
    onMessagesChange(updatedMessages);

    try {
      const history = updatedMessages.slice(0, -1).map(m => ({ role: m.role, text: m.content }));
      const reply = await sendChat(idea, history, trimmed);

      const modelMsg: Omit<AIMessage, 'id' | 'created_at'> = { idea_id: idea.id, role: 'model', content: reply };
      const { data: savedModel } = await supabase.from('ai_messages').insert(modelMsg).select().single();
      onMessagesChange([...updatedMessages, savedModel as AIMessage]);
    } catch (e) {
      console.error('Gemini chat error:', e);
    } finally {
      setSending(false);
    }
  };

  const suggestions = idea.theme ? SUGGESTED_PROMPTS[idea.theme as FinancialTheme] ?? [] : [];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot-outline" size={18} color={Colors.primary} />
        <Text style={styles.headerTitle}>AI Content Assistant</Text>
        <Text style={styles.powered}>Gemini</Text>
      </View>

      {messages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ask Gemini to help develop this content</Text>
          {suggestions.length > 0 && (
            <>
              <Text style={styles.suggestionsLabel}>Suggested prompts:</Text>
              {suggestions.map(prompt => (
                <TouchableOpacity key={prompt} style={styles.suggestionChip} onPress={() => sendMessage(prompt)}>
                  <Text style={styles.suggestionText}>{prompt}</Text>
                  <MaterialCommunityIcons name="send" size={12} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}

      {messages.length > 0 && (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.modelBubble]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>
                {item.content}
              </Text>
            </View>
          )}
        />
      )}

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingText}>Gemini is thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask for talking points, angles, examples..."
          mode="outlined"
          style={styles.input}
          multiline
          maxLength={500}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={() => sendMessage(input)}
          iconColor={sending || !input.trim() ? Colors.border : Colors.primary}
          disabled={sending || !input.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  powered: { fontSize: 10, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  emptyState: { paddingVertical: 8 },
  emptyTitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  suggestionsLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  suggestionText: { flex: 1, fontSize: 13, color: Colors.text, marginRight: 8 },
  messageList: { maxHeight: 320 },
  messageContent: { paddingBottom: 8, gap: 8 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  modelBubble: { alignSelf: 'flex-start', backgroundColor: Colors.background, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  typingText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  input: { flex: 1, fontSize: 14, backgroundColor: Colors.surface, maxHeight: 100 },
});
