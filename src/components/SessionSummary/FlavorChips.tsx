/**
 * FlavorChips Component
 *
 * Displays selected flavors as colored chips with intensity indicators.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SelectedFlavor } from '../../types/flavor.types';
import { flavorService } from '../../services/flavorService';
import { colors, typography, spacing } from '../../theme';

export interface FlavorChipsProps {
  flavors: SelectedFlavor[];
  showIntensity?: boolean;
}

export const FlavorChips: React.FC<FlavorChipsProps> = ({
  flavors,
  showIntensity = true,
}) => {
  if (flavors.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No flavors selected</Text>
      </View>
    );
  }

  // Sort by dominant first, then by intensity
  const sortedFlavors = [...flavors].sort((a, b) => {
    if (a.dominant && !b.dominant) return -1;
    if (!a.dominant && b.dominant) return 1;
    return b.intensity - a.intensity;
  });

  return (
    <View style={styles.container}>
      {sortedFlavors.map((selectedFlavor) => {
        const flavor = flavorService.getFlavorById(selectedFlavor.flavorId);
        if (!flavor) return null;

        return (
          <View
            key={selectedFlavor.flavorId}
            style={[
              styles.chip,
              selectedFlavor.dominant && styles.chipDominant,
            ]}
          >
            <View
              style={[
                styles.colorDot,
                { backgroundColor: flavor.color },
              ]}
            />
            <Text style={styles.flavorName}>
              {flavor.name}
              {selectedFlavor.dominant && ' ★'}
            </Text>
            {showIntensity && (
              <View style={styles.intensityContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.intensityDot,
                      level <= selectedFlavor.intensity && styles.intensityDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipDominant: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flavorName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: spacing.xs,
  },
  intensityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  intensityDotActive: {
    backgroundColor: colors.primary,
  },
});
