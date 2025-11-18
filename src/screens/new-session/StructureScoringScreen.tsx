/**
 * Structure Scoring Screen
 *
 * Rate structural attributes (acidity, sweetness, body, clarity, finish).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { StructureScoringRouteProp } from '../../navigation/types';
import { colors, typography, spacing } from '../../theme';

export const StructureScoringScreen: React.FC = () => {
  const route = useRoute<StructureScoringRouteProp>();
  const { sessionId, coffeeId: _coffeeId, cupId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate Structural Attributes</Text>
      <Text style={styles.subtitle}>
        Session: {sessionId.slice(0, 8)}... | Cup: {cupId.slice(0, 8)}...
      </Text>
      <Text style={styles.placeholder}>Structural scoring UI will go here</Text>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  placeholder: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
