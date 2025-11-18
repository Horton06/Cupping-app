/**
 * History List Screen
 *
 * Browse past tasting sessions with analytics.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export const HistoryListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasting History</Text>
      <Text style={styles.placeholder}>History list with analytics will go here</Text>
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
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  placeholder: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
