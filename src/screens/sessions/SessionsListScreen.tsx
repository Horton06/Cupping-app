/**
 * Sessions List Screen
 *
 * Displays all active tasting sessions.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SessionsScreenNavigationProp } from '../../navigation/types';
import { useSessionState, useSessionActions } from '../../store';
import { colors, typography, spacing } from '../../theme';

export const SessionsListScreen: React.FC = () => {
  const navigation = useNavigation<SessionsScreenNavigationProp>();
  const { sessions, isLoading } = useSessionState();
  const { loadAllSessions } = useSessionActions();

  useEffect(() => {
    loadAllSessions({ sortBy: 'createdAt', sortOrder: 'desc' });
  }, [loadAllSessions]);

  const handleSessionPress = (sessionId: string) => {
    navigation.navigate('SessionDetail', { sessionId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Sessions</Text>
      {isLoading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : sessions.length === 0 ? (
        <Text style={styles.emptyText}>No active sessions. Start a new tasting!</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={() => handleSessionPress(item.id)}
            >
              <Text style={styles.sessionType}>{item.sessionType.replace('-', ' ')}</Text>
              <Text style={styles.sessionDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.coffeeCount}>{item.coffees.length} coffee(s)</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sessionType: {
    ...typography.heading4,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  sessionDate: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  coffeeCount: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
});
