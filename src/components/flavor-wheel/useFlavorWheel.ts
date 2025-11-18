/**
 * useFlavorWheel Hook
 *
 * State management and logic for the flavor wheel component.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { Flavor, BubblePosition, SelectedFlavor } from '../../types/flavor.types';
import { flavorService } from '../../services/flavorService';

export interface UseFlavorWheelOptions {
  initialSelectedFlavors?: SelectedFlavor[];
  onSelectionChange?: (flavors: SelectedFlavor[]) => void;
  maxSelections?: number;
}

export const useFlavorWheel = ({
  initialSelectedFlavors = [],
  onSelectionChange,
  maxSelections = 10,
}: UseFlavorWheelOptions = {}) => {
  // Selected flavors state
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>(initialSelectedFlavors);

  // Viewport transform (pan and zoom)
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Get all flavors and positions
  const flavors = useMemo(() => flavorService.getAllFlavors(), []);
  const bubblePositions = useMemo(() => flavorService.calculateBubblePositions(), []);

  // Create map for quick lookup
  const flavorMap = useMemo(() => {
    const map = new Map<number, Flavor>();
    flavors.forEach(flavor => map.set(flavor.id, flavor));
    return map;
  }, [flavors]);

  const positionMap = useMemo(() => {
    const map = new Map<number, BubblePosition>();
    bubblePositions.forEach(pos => map.set(pos.number, pos));
    return map;
  }, [bubblePositions]);

  // Toggle flavor selection
  const toggleFlavor = useCallback((flavor: Flavor) => {
    setSelectedFlavors(prev => {
      const existingIndex = prev.findIndex(f => f.flavorId === flavor.id);

      if (existingIndex >= 0) {
        // Remove if already selected
        const newSelection = prev.filter((_, i) => i !== existingIndex);
        onSelectionChange?.(newSelection);
        return newSelection;
      } else {
        // Add if not at max
        if (prev.length >= maxSelections) {
          return prev; // Don't add if at max
        }

        const newFlavor: SelectedFlavor = {
          flavorId: flavor.id,
          intensity: 3, // Default intensity
          dominant: false,
        };
        const newSelection = [...prev, newFlavor];
        onSelectionChange?.(newSelection);
        return newSelection;
      }
    });
  }, [maxSelections, onSelectionChange]);

  // Update flavor intensity
  const updateIntensity = useCallback((flavorId: number, intensity: 1 | 2 | 3 | 4 | 5) => {
    setSelectedFlavors(prev => {
      const newSelection = prev.map(f =>
        f.flavorId === flavorId ? { ...f, intensity } : f
      );
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Mark flavor as dominant
  const toggleDominant = useCallback((flavorId: number) => {
    setSelectedFlavors(prev => {
      const newSelection = prev.map(f =>
        f.flavorId === flavorId ? { ...f, dominant: !f.dominant } : f
      );
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Remove flavor
  const removeFlavor = useCallback((flavorId: number) => {
    setSelectedFlavors(prev => {
      const newSelection = prev.filter(f => f.flavorId !== flavorId);
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedFlavors([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Check if flavor is selected
  const isFlavorSelected = useCallback((flavorId: number) => {
    return selectedFlavors.some(f => f.flavorId === flavorId);
  }, [selectedFlavors]);

  // Get intensity for selected flavor
  const getFlavorIntensity = useCallback((flavorId: number) => {
    return selectedFlavors.find(f => f.flavorId === flavorId)?.intensity || 3;
  }, [selectedFlavors]);

  // Reset viewport
  const resetViewport = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
  }, [translateX, translateY, scale]);

  return {
    // State
    selectedFlavors,
    flavors,
    bubblePositions,
    flavorMap,
    positionMap,

    // Viewport
    translateX,
    translateY,
    scale,

    // Actions
    toggleFlavor,
    updateIntensity,
    toggleDominant,
    removeFlavor,
    clearSelections,
    isFlavorSelected,
    getFlavorIntensity,
    resetViewport,
  };
};
