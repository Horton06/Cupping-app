/**
 * Error State Component
 *
 * Displays error messages with optional retry action.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../Button';
import { colors, spacing, typography } from '../../theme';

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    title: string;
    onPress: () => void;
  };
}

export const ErrorState: React.FC<ErrorStateProps> = memo(({
  title = 'Error',
  message,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          style={styles.button}
        />
      )}
    </View>
  );
});

ErrorState.displayName = 'ErrorState';

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
    fontSize: 48,
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
  },
  button: {
    minWidth: 200,
  },
});
