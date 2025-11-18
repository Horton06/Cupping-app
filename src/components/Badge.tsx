/**
 * Badge Component
 *
 * Small label/tag for displaying categories, status, etc.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string; // Custom color override
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = memo(({
  label,
  variant = 'default',
  color,
  style,
}) => {
  const backgroundColor = color || variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const variantColors: Record<BadgeVariant, string> = {
  default: colors.surface,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
