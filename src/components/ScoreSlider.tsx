/**
 * ScoreSlider Component
 *
 * Interactive slider for rating coffee attributes on 1-5 scale.
 * Used for structural scoring (acidity, sweetness, body, clarity, finish).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../theme';
import type { ScoreValue } from '../types/session.types';

export interface ScoreSliderProps {
  label: string;
  leftLabel?: string; // Low end descriptor (e.g., "Flat")
  rightLabel?: string; // High end descriptor (e.g., "Bright")
  value: ScoreValue;
  onChange: (value: ScoreValue) => void;
  disabled?: boolean;
}

const SCORE_VALUES: ScoreValue[] = [1, 2, 3, 4, 5];

export const ScoreSlider: React.FC<ScoreSliderProps> = ({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
  disabled = false,
}) => {
  const [hoveredValue, setHoveredValue] = useState<ScoreValue | null>(null);

  const handlePress = (scoreValue: ScoreValue) => {
    if (!disabled) {
      onChange(scoreValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Score buttons */}
      <View style={styles.scoreContainer}>
        {SCORE_VALUES.map(scoreValue => {
          const isSelected = value === scoreValue;
          const isHovered = hoveredValue === scoreValue;

          return (
            <TouchableOpacity
              key={scoreValue}
              style={[
                styles.scoreButton,
                isSelected && styles.scoreButtonSelected,
                (isHovered && !isSelected) && styles.scoreButtonHovered,
                disabled && styles.scoreButtonDisabled,
              ]}
              onPress={() => handlePress(scoreValue)}
              onPressIn={() => setHoveredValue(scoreValue)}
              onPressOut={() => setHoveredValue(null)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.scoreText,
                  isSelected && styles.scoreTextSelected,
                ]}
              >
                {scoreValue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Descriptors */}
      {(leftLabel || rightLabel) && (
        <View style={styles.descriptorContainer}>
          {leftLabel && <Text style={styles.descriptorLeft}>{leftLabel}</Text>}
          <View style={styles.descriptorSpacer} />
          {rightLabel && <Text style={styles.descriptorRight}>{rightLabel}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  scoreButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scoreButtonHovered: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  scoreButtonDisabled: {
    opacity: 0.5,
  },
  scoreText: {
    ...typography.heading3,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  scoreTextSelected: {
    color: colors.text.primary,
  },
  descriptorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  descriptorLeft: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  descriptorSpacer: {
    flex: 1,
  },
  descriptorRight: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
});
