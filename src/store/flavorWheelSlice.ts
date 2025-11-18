/**
 * Flavor Wheel Store Slice
 *
 * Manages flavor wheel UI state (viewport, selection, search).
 */

import type { StateCreator } from 'zustand';
import type { ViewportTransform } from '../types/flavor.types';

/**
 * Flavor wheel slice state
 */
export interface FlavorWheelSlice {
  // Viewport state
  viewportTransform: ViewportTransform;
  centeredFlavorId: number | null;
  isAnimating: boolean;

  // Search & filter
  searchQuery: string;
  categoryFilter: string | null;

  // Actions
  setViewportTransform: (transform: Partial<ViewportTransform>) => void;
  setCenteredFlavor: (flavorId: number | null) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  resetViewport: () => void;
  clearFilters: () => void;
}

/**
 * Default viewport transform (centered, no zoom)
 */
const DEFAULT_VIEWPORT: ViewportTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

/**
 * Create flavor wheel slice
 */
export const createFlavorWheelSlice: StateCreator<FlavorWheelSlice> = (set, _get) => ({
  // Initial state
  viewportTransform: DEFAULT_VIEWPORT,
  centeredFlavorId: null,
  isAnimating: false,
  searchQuery: '',
  categoryFilter: null,

  // Update viewport transform (partial update)
  setViewportTransform: (transform: Partial<ViewportTransform>) => {
    set(state => ({
      viewportTransform: {
        ...state.viewportTransform,
        ...transform,
      },
    }));
  },

  // Center on a specific flavor
  setCenteredFlavor: (flavorId: number | null) => {
    set({ centeredFlavorId: flavorId });
  },

  // Set animation state
  setIsAnimating: (isAnimating: boolean) => {
    set({ isAnimating });
  },

  // Update search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Set category filter
  setCategoryFilter: (category: string | null) => {
    set({ categoryFilter: category });
  },

  // Reset viewport to default
  resetViewport: () => {
    set({
      viewportTransform: DEFAULT_VIEWPORT,
      centeredFlavorId: null,
    });
  },

  // Clear all filters
  clearFilters: () => {
    set({
      searchQuery: '',
      categoryFilter: null,
    });
  },
});
