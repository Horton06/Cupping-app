/**
 * Coffee Setup Screen
 *
 * Configure coffee details for the tasting session.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { CoffeeSetupRouteProp } from '../../navigation/types';
import { colors, typography, spacing } from '../../theme';

export const CoffeeSetupScreen: React.FC = () => {
  const route = useRoute<CoffeeSetupRouteProp>();
  const { sessionType } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coffee Setup</Text>
      <Text style={styles.subtitle}>Session Type: {sessionType}</Text>
      <Text style={styles.placeholder}>Coffee setup form will go here</Text>
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
    ...typography.body,
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
