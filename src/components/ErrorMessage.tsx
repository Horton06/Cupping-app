/**
 * ErrorMessage Component
 *
 * Display error messages with optional retry action.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { Button } from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          size="small"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  title: {
    ...typography.heading4,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
