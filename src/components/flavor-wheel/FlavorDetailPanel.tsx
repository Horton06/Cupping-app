/**
 * FlavorDetailPanel Component
 *
 * Bottom panel showing selected flavors with intensity adjustment.
 * Features swipe-to-remove gesture for deselecting flavors.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type { SelectedFlavor } from '../../types/flavor.types';
import type { Flavor } from '../../types/flavor.types';
import { colors, typography, spacing } from '../../theme';
import { Badge } from '../Badge';

const SWIPE_THRESHOLD = -80; // Pixels to swipe before removing

export interface FlavorDetailPanelProps {
  selectedFlavors: SelectedFlavor[];
  flavorMap: Map<number, Flavor>;
  onUpdateIntensity: (flavorId: number, intensity: 1 | 2 | 3 | 4 | 5) => void;
  onRemoveFlavor: (flavorId: number) => void;
  onToggleDominant: (flavorId: number) => void;
  maxSelections?: number;
}

const IntensityDot: React.FC<{ filled: boolean; color: string }> = ({ filled, color }) => (
  <View
    style={[
      styles.intensityDot,
      { borderColor: color },
      filled && { backgroundColor: color },
    ]}
  />
);

const SelectedFlavorItem: React.FC<{
  selectedFlavor: SelectedFlavor;
  flavor: Flavor;
  onUpdateIntensity: (intensity: 1 | 2 | 3 | 4 | 5) => void;
  onRemove: () => void;
  onToggleDominant: () => void;
}> = ({ selectedFlavor, flavor, onUpdateIntensity, onRemove, onToggleDominant }) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      // Only allow left swipe
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // Swipe far enough - remove
        runOnJS(onRemove)();
      }
      // Snap back
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.flavorItem, animatedStyle]}>
        {/* Color indicator */}
        <View style={[styles.colorIndicator, { backgroundColor: flavor.color }]} />

        {/* Flavor info */}
        <View style={styles.flavorInfo}>
          <Text style={styles.flavorName} numberOfLines={1}>
            {flavor.name}
          </Text>
          <Text style={styles.flavorCategory} numberOfLines={1}>
            {flavor.category}
          </Text>
        </View>

        {/* Intensity dots */}
        <View style={styles.intensityContainer}>
          {[1, 2, 3, 4, 5].map(level => (
            <TouchableOpacity
              key={level}
              onPress={() => onUpdateIntensity(level as 1 | 2 | 3 | 4 | 5)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <IntensityDot
                filled={selectedFlavor.intensity >= level}
                color={flavor.color}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Dominant toggle */}
        <TouchableOpacity onPress={onToggleDominant} style={styles.dominantButton}>
          {selectedFlavor.dominant && (
            <Badge label="★" variant="primary" style={styles.dominantBadge} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

export const FlavorDetailPanel: React.FC<FlavorDetailPanelProps> = ({
  selectedFlavors,
  flavorMap,
  onUpdateIntensity,
  onRemoveFlavor,
  onToggleDominant,
  maxSelections = 10,
}) => {
  if (selectedFlavors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No flavors selected</Text>
          <Text style={styles.emptySubtitle}>
            Tap bubbles on the wheel to select flavors
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Selected Flavors ({selectedFlavors.length}/{maxSelections})
        </Text>
        <Text style={styles.headerSubtitle}>Swipe left to remove</Text>
      </View>

      {/* Flavor list */}
      <FlatList
        data={selectedFlavors}
        keyExtractor={item => item.flavorId.toString()}
        renderItem={({ item }) => {
          const flavor = flavorMap.get(item.flavorId);
          if (!flavor) return null;

          return (
            <SelectedFlavorItem
              selectedFlavor={item}
              flavor={flavor}
              onUpdateIntensity={(intensity) => onUpdateIntensity(item.flavorId, intensity)}
              onRemove={() => onRemoveFlavor(item.flavorId)}
              onToggleDominant={() => onToggleDominant(item.flavorId)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: 300,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  flavorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  flavorInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  flavorName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  flavorCategory: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: spacing.xs,
  },
  dominantButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dominantBadge: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
