/**
 * Shadow Styles
 *
 * Provides consistent elevation levels across iOS and Android.
 * Includes both iOS shadow properties and Android elevation.
 */

import { ViewStyle } from 'react-native';

/**
 * No shadow/elevation
 */
export const shadowNone: ViewStyle = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

/**
 * Small shadow - subtle depth for slightly elevated elements
 * Use for: chips, small cards, buttons
 */
export const shadowSmall: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};

/**
 * Medium shadow - standard depth for cards and panels
 * Use for: cards, bottom sheets, modals (background)
 */
export const shadowMedium: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
};

/**
 * Large shadow - significant depth for prominent elements
 * Use for: floating action buttons, prominent modals, overlays
 */
export const shadowLarge: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 8,
};

/**
 * Extra-large shadow - maximum depth for critical elements
 * Use for: important dialogs, fullscreen overlays
 */
export const shadowXLarge: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.25,
  shadowRadius: 24,
  elevation: 12,
};

/**
 * Shadow collection for easy import
 */
export const shadows = {
  none: shadowNone,
  small: shadowSmall,
  medium: shadowMedium,
  large: shadowLarge,
  xlarge: shadowXLarge,
} as const;

/**
 * Shadow type for TypeScript autocomplete
 */
export type ShadowKey = keyof typeof shadows;
