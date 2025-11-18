/**
 * Session Detail Screen
 *
 * Shows details of a specific tasting session.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { SessionDetailRouteProp } from '../../navigation/types';
import { useSessionState, useSessionActions } from '../../store';
import { colors, typography, spacing } from '../../theme';

export const SessionDetailScreen: React.FC = () => {
  const route = useRoute<SessionDetailRouteProp>();
  const { sessionId } = route.params;
  const { currentSession, isLoading } = useSessionState();
  const { loadSession } = useSessionActions();

  useEffect(() => {
    loadSession(sessionId);
  }, [sessionId, loadSession]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{currentSession.sessionType}</Text>
      <Text style={styles.date}>
        {new Date(currentSession.createdAt).toLocaleString()}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coffees</Text>
        {currentSession.coffees.map(coffee => (
          <View key={coffee.coffeeId} style={styles.coffeeCard}>
            <Text style={styles.coffeeName}>{coffee.name}</Text>
            {coffee.roaster && (
              <Text style={styles.coffeeDetail}>Roaster: {coffee.roaster}</Text>
            )}
            {coffee.origin && <Text style={styles.coffeeDetail}>Origin: {coffee.origin}</Text>}
            <Text style={styles.cupCount}>{coffee.cups.length} cup(s)</Text>
          </View>
        ))}
      </View>

      {currentSession.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{currentSession.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  coffeeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  coffeeName: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  coffeeDetail: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cupCount: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  notes: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
});
