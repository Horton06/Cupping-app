/**
 * Flavor Service
 *
 * Manages flavor data operations including loading, searching,
 * and bubble position calculations for the flavor wheel.
 *
 * Pre-loads and caches all flavor data for fast lookups.
 */

import flavorData from '../../assets/data/flavor-descriptors.json';
import type {
  Flavor,
  FlavorData,
  FlavorCategory,
  BubblePosition,
} from '../types/flavor.types';

/**
 * Honeycomb Ring-Based Arrangement Algorithm
 *
 * Places 132 flavors in 4 concentric rings around a void center.
 * Alternating rings are offset by half an angle step to create
 * an interlocking honeycomb appearance.
 *
 * Ring configuration matches web mockup:
 * - Ring 1: 24 bubbles at radius 320px
 * - Ring 2: 30 bubbles at radius 400px
 * - Ring 3: 36 bubbles at radius 480px
 * - Ring 4: 42 bubbles at radius 560px
 *
 * @param flavors - Array of flavors to position (should be 132)
 * @returns Array of bubble positions
 */
function calculateBubblePositionsAlgorithm(flavors: Flavor[]): BubblePosition[] {
  const positions: BubblePosition[] = [];
  const centerX = 450;
  const centerY = 450;
  const voidCenterRadius = 120; // Empty center space
  const bubbleRadius = 40;

  // Ring configuration: [count, radiusMultiplier]
  const rings = [
    { count: 24, radiusMultiplier: 5.0 },  // Ring 1: 320px
    { count: 30, radiusMultiplier: 7.0 },  // Ring 2: 400px
    { count: 36, radiusMultiplier: 9.0 },  // Ring 3: 480px
    { count: 42, radiusMultiplier: 11.0 }, // Ring 4: 560px
  ];

  let flavorIndex = 0;

  // Place flavors in each ring
  rings.forEach((ring, ringIndex) => {
    const radius = voidCenterRadius + bubbleRadius * ring.radiusMultiplier;

    // Offset alternating rings by half an angle step for honeycomb effect
    const offsetAngle = ringIndex % 2 === 0 ? 0 : Math.PI / ring.count;

    for (let i = 0; i < ring.count && flavorIndex < flavors.length; i++, flavorIndex++) {
      const flavor = flavors[flavorIndex];
      const angle = (i * 2 * Math.PI) / ring.count;
      const finalAngle = angle + offsetAngle;

      positions.push({
        tempId: `flavor-${flavor.id}`,
        number: flavor.id,
        radius,
        angle: finalAngle,
        // Pre-calculate screen coordinates
        x: centerX + radius * Math.cos(finalAngle),
        y: centerY + radius * Math.sin(finalAngle),
      });
    }
  });

  return positions;
}

/**
 * FlavorService - Singleton flavor data manager
 */
class FlavorService {
  private flavorData: FlavorData;
  private flavorCache: Map<number, Flavor>;
  private bubblePositions: BubblePosition[];
  private categoryCache: Map<string, FlavorCategory>;

  constructor() {
    this.flavorData = flavorData as FlavorData;
    this.flavorCache = new Map();
    this.bubblePositions = [];
    this.categoryCache = new Map();

    // Initialize caches on construction
    this.initializeCache();
  }

  /**
   * Build flavor cache and category mappings.
   * Pre-calculates bubble positions for performance.
   */
  private initializeCache(): void {
    console.log('[FlavorService] Initializing flavor cache...');

    // Build flavor cache with computed properties
    Object.entries(this.flavorData.descriptorMapping).forEach(([idStr, name]) => {
      const flavorId = parseInt(idStr, 10);
      const category = this.findCategoryForFlavor(flavorId);
      const categoryColor = this.flavorData.categoryColors[category] || '#888888';

      const flavor: Flavor = {
        id: flavorId,
        name,
        category,
        description: this.flavorData.descriptions[name] || '',
        color: categoryColor,
        relatedIds:
          this.flavorData.relatedFlavors[idStr]?.map(id =>
            typeof id === 'string' ? parseInt(id, 10) : id
          ) || [],
      };

      this.flavorCache.set(flavorId, flavor);
    });

    console.log(`[FlavorService] Cached ${this.flavorCache.size} flavors`);

    // Calculate bubble positions
    const allFlavors = Array.from(this.flavorCache.values()).sort((a, b) => a.id - b.id);
    this.bubblePositions = calculateBubblePositionsAlgorithm(allFlavors);
    console.log(`[FlavorService] Calculated ${this.bubblePositions.length} bubble positions`);

    // Build category cache
    Object.entries(this.flavorData.categories).forEach(([categoryName, flavorIds]) => {
      const category: FlavorCategory = {
        name: categoryName,
        displayName: this.formatCategoryName(categoryName),
        color: this.flavorData.categoryColors[categoryName] || '#888888',
        flavorIds,
        count: flavorIds.length,
      };
      this.categoryCache.set(categoryName, category);
    });

    console.log(`[FlavorService] Cached ${this.categoryCache.size} categories`);
    console.log('[FlavorService] Initialization complete');
  }

  /**
   * Find category for a specific flavor ID
   */
  private findCategoryForFlavor(flavorId: number): string {
    for (const [categoryName, flavorIds] of Object.entries(this.flavorData.categories)) {
      if (flavorIds.includes(flavorId)) {
        return categoryName;
      }
    }
    return 'OTHER';
  }

  /**
   * Format category name for display
   * @example "NUTTY/COCOA" → "Nutty/Cocoa"
   */
  private formatCategoryName(categoryName: string): string {
    return categoryName
      .split('/')
      .map(word =>
        word
          .toLowerCase()
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      )
      .join('/');
  }

  /**
   * Load flavor data (synchronous since data is already loaded)
   * Included for API compatibility
   */
  async loadFlavorData(): Promise<FlavorData> {
    return this.flavorData;
  }

  /**
   * Get flavor by ID
   */
  getFlavorById(id: number): Flavor | null {
    return this.flavorCache.get(id) || null;
  }

  /**
   * Get all flavors in a category
   */
  getFlavorsByCategory(category: string): Flavor[] {
    const categoryData = this.categoryCache.get(category);
    if (!categoryData) {
      return [];
    }

    return categoryData.flavorIds
      .map(id => this.flavorCache.get(id))
      .filter((flavor): flavor is Flavor => flavor !== undefined);
  }

  /**
   * Search flavors by name or description
   * Case-insensitive partial match
   */
  searchFlavors(query: string): Flavor[] {
    if (!query || query.trim().length === 0) {
      return Array.from(this.flavorCache.values());
    }

    const lowerQuery = query.toLowerCase().trim();

    return Array.from(this.flavorCache.values()).filter(flavor => {
      const nameMatch = flavor.name.toLowerCase().includes(lowerQuery);
      const descMatch = flavor.description.toLowerCase().includes(lowerQuery);
      return nameMatch || descMatch;
    });
  }

  /**
   * Get related flavors for a given flavor ID
   */
  getRelatedFlavors(id: number): Flavor[] {
    const flavor = this.flavorCache.get(id);
    if (!flavor) {
      return [];
    }

    return flavor.relatedIds
      .map(relatedId => this.flavorCache.get(relatedId))
      .filter((f): f is Flavor => f !== undefined);
  }

  /**
   * Get all categories with metadata
   */
  getAllCategories(): FlavorCategory[] {
    return Array.from(this.categoryCache.values());
  }

  /**
   * Get pre-calculated bubble positions for flavor wheel.
   * Uses concentric circular arrangement.
   */
  calculateBubblePositions(): BubblePosition[] {
    return this.bubblePositions;
  }

  /**
   * Get category for a specific flavor ID
   */
  getCategoryForFlavor(flavorId: number): string | null {
    const flavor = this.flavorCache.get(flavorId);
    return flavor ? flavor.category : null;
  }

  /**
   * Get color for a specific flavor ID
   */
  getColorForFlavor(flavorId: number): string {
    const flavor = this.flavorCache.get(flavorId);
    return flavor ? flavor.color : '#888888';
  }

  /**
   * Get all flavors (for testing/debugging)
   */
  getAllFlavors(): Flavor[] {
    return Array.from(this.flavorCache.values()).sort((a, b) => a.id - b.id);
  }

  /**
   * Get flavor count
   */
  getFlavorCount(): number {
    return this.flavorCache.size;
  }

  /**
   * Get category color
   */
  getCategoryColor(categoryName: string): string {
    const category = this.categoryCache.get(categoryName);
    return category ? category.color : '#888888';
  }
}

// Export singleton instance
export const flavorService = new FlavorService();
export default flavorService;
