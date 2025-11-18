/**
 * Divider Component
 *
 * Horizontal or vertical dividing line.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

export interface DividerProps {
  vertical?: boolean;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  spacing: spacingProp = 'medium',
  style,
}) => {
  const spacingStyle = spacingProp === 'none'
    ? styles.spacingNone
    : spacingProp === 'small'
    ? styles.spacingSmall
    : spacingProp === 'large'
    ? styles.spacingLarge
    : styles.spacingMedium;

  return (
    <View
      style={[
        styles.divider,
        vertical ? styles.vertical : styles.horizontal,
        spacingStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.divider,
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
  spacingNone: {
    marginVertical: 0,
  },
  spacingSmall: {
    marginVertical: spacing.sm,
  },
  spacingMedium: {
    marginVertical: spacing.md,
  },
  spacingLarge: {
    marginVertical: spacing.lg,
  },
});
