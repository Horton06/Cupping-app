/**
 * Theme System - Barrel Export
 *
 * Central export for all theme tokens.
 * Import from '@/theme' to access colors, typography, spacing, and shadows.
 *
 * @example
 * import { colors, typography, spacing, shadows } from '@/theme';
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

// Re-export as named objects for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, layout } from './spacing';
export { shadows } from './shadows';
