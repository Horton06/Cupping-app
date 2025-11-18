/**
 * Spacing Scale
 *
 * Uses 4px base unit for consistent spacing throughout the app.
 * Provides a scale from extra-small (4px) to extra-extra-large (64px).
 */

export const spacing = {
  /**
   * 4px - Minimal spacing for tight layouts
   */
  xs: 4,

  /**
   * 8px - Small spacing between related elements
   */
  sm: 8,

  /**
   * 12px - Medium-small spacing
   */
  md: 12,

  /**
   * 16px - Standard spacing (most common)
   */
  lg: 16,

  /**
   * 24px - Large spacing for section separation
   */
  xl: 24,

  /**
   * 32px - Extra-large spacing for major sections
   */
  xxl: 32,

  /**
   * 48px - Extra-extra-large spacing for screen padding
   */
  xxxl: 48,

  /**
   * 64px - Maximum spacing for large gaps
   */
  xxxxl: 64,
} as const;

/**
 * Common spacing patterns for consistent layouts
 */
export const layout = {
  /**
   * Standard screen padding (horizontal)
   */
  screenPaddingHorizontal: spacing.lg,

  /**
   * Standard screen padding (vertical)
   */
  screenPaddingVertical: spacing.xl,

  /**
   * Card padding
   */
  cardPadding: spacing.lg,

  /**
   * Gap between cards/items in a list
   */
  listItemGap: spacing.md,

  /**
   * Bottom tab bar height
   */
  tabBarHeight: 56,

  /**
   * Minimum touch target size (accessibility)
   */
  minTouchTarget: 44,

  /**
   * Border radius for cards
   */
  borderRadiusSmall: 8,
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  borderRadiusRound: 999,

  /**
   * Border width
   */
  borderWidthThin: 1,
  borderWidthMedium: 2,
  borderWidthThick: 3,
} as const;

/**
 * Spacing type for TypeScript autocomplete
 */
export type SpacingKey = keyof typeof spacing;
export type LayoutKey = keyof typeof layout;
