/**
 * Empty State Component
 *
 * Displays when there's no data to show.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../Button';
import { colors, spacing, typography } from '../../theme';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    title: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  icon = '📋',
  title,
  message,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 64,
    opacity: 0.5,
  },
  title: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
  },
});
