/**
 * Session Notes Screen
 *
 * Add notes and tags to the tasting session.
 * Features debounced auto-save, tag selector, and character count.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  SessionNotesRouteProp,
  NewSessionNavigationProp,
} from '../../navigation/types';
import { Button, Card } from '../../components';
import { TagSelector } from '../../components/Forms';
import { sessionService } from '../../services/sessionService';
import { useDebounce } from '../../hooks/useDebounce';
import { colors, spacing, typography } from '../../theme';

const MAX_NOTES_LENGTH = 2000;

export const SessionNotesScreen: React.FC = () => {
  const route = useRoute<SessionNotesRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionId } = route.params;

  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing notes and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await sessionService.getSession(sessionId);
        if (session) {
          setNotes(session.notes || '');
          setTags(session.tags || []);
        }
      } catch (error) {
        console.error('[SessionNotes] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  // Auto-save function (debounced)
  const saveData = useCallback(
    async (notesText: string, tagsList: string[]) => {
      try {
        setIsSaving(true);
        await sessionService.updateSessionNotes(sessionId, notesText, tagsList);
      } catch (error) {
        console.error('[SessionNotes] Error saving data:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [sessionId]
  );

  // Debounce the save function (1 second delay)
  const debouncedSave = useDebounce<(notesText: string, tagsList: string[]) => Promise<void>>(
    saveData,
    1000
  );

  // Update notes with debounced save
  const handleNotesChange = useCallback(
    (text: string) => {
      setNotes(text);
      debouncedSave(text, tags);
    },
    [tags, debouncedSave]
  );

  // Update tags with debounced save
  const handleTagsChange = useCallback(
    (newTags: string[]) => {
      setTags(newTags);
      debouncedSave(notes, newTags);
    },
    [notes, debouncedSave]
  );

  // Continue to summary
  const handleContinue = useCallback(async () => {
    // Force immediate save before continuing
    await saveData(notes, tags);
    navigation.navigate('SessionSummary', { sessionId });
  }, [notes, tags, saveData, sessionId, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Notes & Tags</Text>
            <Text style={styles.subtitle}>
              Add any observations or categorize this session
            </Text>

            {/* Notes Section */}
            <Card style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Tasting Notes</Text>
                <Text
                  style={[
                    styles.charCount,
                    notes.length > MAX_NOTES_LENGTH * 0.9 && styles.charCountWarning,
                  ]}
                >
                  {notes.length} / {MAX_NOTES_LENGTH}
                </Text>
              </View>

              <RNTextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={handleNotesChange}
                placeholder="Describe your tasting experience, brewing notes, comparisons, or anything else worth remembering..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={8}
                maxLength={MAX_NOTES_LENGTH}
                textAlignVertical="top"
                blurOnSubmit={false}
              />

              {isSaving && (
                <Text style={styles.savingIndicator}>Saving...</Text>
              )}
            </Card>

            {/* Tags Section */}
            <Card style={styles.section}>
              <Text style={styles.label}>Tags</Text>
              <Text style={styles.helperText}>
                Select or create tags to categorize this session
              </Text>

              <TagSelector
                selectedTags={tags}
                onTagsChange={handleTagsChange}
                disabled={false}
              />
            </Card>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue to Summary"
            onPress={handleContinue}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  title: {
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  charCount: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  charCountWarning: {
    color: colors.error,
    fontWeight: '600',
  },
  notesInput: {
    ...typography.body,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.text.primary,
    minHeight: 200,
    maxHeight: 300,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  savingIndicator: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
