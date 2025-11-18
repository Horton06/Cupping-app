/**
 * RoastLevelPicker Component
 *
 * Picker for selecting coffee roast level.
 * Displays options as selectable chips.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { RoastLevel } from '../../types/session.types';
import { colors, typography, spacing } from '../../theme';

export interface RoastLevelPickerProps {
  label?: string;
  value?: RoastLevel;
  onChange: (level: RoastLevel | undefined) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

const ROAST_LEVELS: Array<{ value: RoastLevel; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'medium-light', label: 'Medium-Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium-dark', label: 'Medium-Dark' },
  { value: 'dark', label: 'Dark' },
];

export const RoastLevelPicker: React.FC<RoastLevelPickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
}) => {
  const handleSelect = (level: RoastLevel) => {
    if (disabled) return;

    // Toggle selection - if already selected, deselect
    if (value === level) {
      onChange(undefined);
    } else {
      onChange(level);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.optionsContainer}>
        {ROAST_LEVELS.map(level => {
          const isSelected = value === level.value;

          return (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => handleSelect(level.value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 100,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
