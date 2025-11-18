/**
 * Session Notes Screen
 *
 * Add notes and tags to the tasting session.
 * Part of the session flow between structure scoring and summary.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  SessionNotesRouteProp,
  NewSessionNavigationProp,
} from '../../navigation/types';
import { TextInput, Button } from '../../components';
import { sessionService } from '../../services/sessionService';
import { colors, spacing } from '../../theme';

export const SessionNotesScreen: React.FC = () => {
  const route = useRoute<SessionNotesRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionId } = route.params;

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const session = await sessionService.getSession(sessionId);
        if (session?.notes) {
          setNotes(session.notes);
        }
      } catch (error) {
        console.error('[SessionNotes] Error loading notes:', error);
      }
    };

    loadNotes();
  }, [sessionId]);

  // Auto-save notes (debounced would be better in production)
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await sessionService.updateSessionNotes(sessionId, notes);
    } catch (error) {
      console.error('[SessionNotes] Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, notes]);

  // Continue to summary
  const handleContinue = useCallback(async () => {
    await handleSave();
    navigation.navigate('SessionSummary', { sessionId });
  }, [handleSave, sessionId, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Notes Input */}
          <TextInput
            label="Session Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={10}
            placeholder="Add any notes about this tasting session..."
            helperText="Describe your overall impression, brewing notes, or anything else worth remembering"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue to Summary"
            onPress={handleContinue}
            loading={isSaving}
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
