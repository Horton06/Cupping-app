/**
 * Flavor System Types
 *
 * TypeScript interfaces for the flavor wheel system.
 */

/**
 * Raw flavor data structure from JSON
 */
export interface FlavorData {
  descriptorMapping: Record<string, string>;
  descriptions: Record<string, string>;
  categoryColors: Record<string, string>;
  categories: Record<string, number[]>;
  relatedFlavors: Record<string, number[]>;
}

/**
 * Individual flavor descriptor with computed properties
 */
export interface Flavor {
  id: number;
  name: string;
  category: string;
  description: string;
  color: string;
  relatedIds: number[];
}

/**
 * Selected flavor in a tasting session
 */
export interface SelectedFlavor {
  flavorId: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  dominant?: boolean;
}

/**
 * Bubble position for rendering flavor wheel
 * Uses concentric circular arrangement (NOT hexagonal packing)
 */
export interface BubblePosition {
  tempId: string; // Unique render key: `flavor-${number}`
  number: number; // Flavor ID (1-132)
  radius: number; // Distance from center in pixels
  angle: number; // Angle in radians
  x?: number; // Cached screen x coordinate (optional)
  y?: number; // Cached screen y coordinate (optional)
}

/**
 * Category with metadata
 */
export interface FlavorCategory {
  name: string;
  displayName: string; // Human-readable version
  color: string;
  flavorIds: number[];
  count: number;
}

/**
 * Category name mapping (database format to display format)
 */
export type CategoryName =
  | 'FRUITY'
  | 'FLORAL'
  | 'SWEET'
  | 'NUTTY/COCOA'
  | 'SPICES'
  | 'ROASTED'
  | 'GREEN/VEGETATIVE'
  | 'CHEMICAL'
  | 'EARTHY'
  | 'OTHER';

/**
 * Flavor wheel viewport transform state
 */
export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

/**
 * Flavor wheel UI state
 */
export interface FlavorWheelState {
  selectedFlavors: SelectedFlavor[];
  viewportTransform: ViewportTransform;
  searchQuery: string;
  categoryFilter: string | null;
  centeredFlavorId: number | null;
  isAnimating: boolean;
}
