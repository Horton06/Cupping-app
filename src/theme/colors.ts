/**
 * Color Palette
 *
 * Based on honeycomb reference design with pure black background
 * and category-based vibrant colors from flavor-descriptors.json
 */

export const colors = {
  // Base colors
  background: '#000000',           // Pure black for OLED-friendly design
  surface: '#1a1a1a',             // Elevated surfaces (cards, panels)
  surfaceElevated: '#2a2a2a',     // Higher elevation surfaces

  // Text colors
  text: '#ffffff',                // Primary text
  textSecondary: '#888888',       // Secondary text, labels
  textTertiary: '#666666',        // Disabled, placeholder text

  // Border and divider
  border: 'rgba(255, 255, 255, 0.3)',  // Subtle borders
  divider: 'rgba(255, 255, 255, 0.1)', // Dividing lines

  // Category colors (from flavor-descriptors.json)
  // These are used for flavor wheel bubbles
  fruity: '#D73027',              // Red tones
  floral: '#FC8D59',              // Orange tones
  sweet: '#FEE08B',               // Yellow tones
  nuttyCocoa: '#D9EF8B',          // Yellow-green tones
  spices: '#91CF60',              // Light green
  roasted: '#1A9850',             // Dark green
  greenVegetative: '#66BD63',     // Medium green
  chemical: '#3288BD',            // Blue tones
  earthy: '#5E4FA2',              // Purple tones
  other: '#9E0142',               // Dark red

  // Semantic colors
  success: '#10B981',             // Green for success states
  warning: '#F59E0B',             // Amber for warnings
  error: '#DC2626',               // Red for errors
  info: '#3B82F6',                // Blue for info

  // Interactive states
  hover: 'rgba(255, 255, 255, 0.1)',
  pressed: 'rgba(255, 255, 255, 0.05)',
  focus: 'rgba(255, 255, 255, 0.2)',
  disabled: 'rgba(255, 255, 255, 0.3)',
} as const;

/**
 * Color type for TypeScript autocomplete
 */
export type ColorKey = keyof typeof colors;
