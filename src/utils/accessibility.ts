/**
 * Accessibility Utilities
 *
 * Helper functions and constants for accessibility features.
 */

import { AccessibilityInfo } from 'react-native';

/**
 * Minimum touch target size in points (WCAG 2.1 Level AAA)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('[Accessibility] Error checking screen reader status:', error);
    return false;
  }
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch (error) {
    console.error('[Accessibility] Error announcing for accessibility:', error);
  }
}

/**
 * Get accessibility hints for common UI patterns
 */
export const AccessibilityHints = {
  tapToSelect: 'Double tap to select',
  tapToOpen: 'Double tap to open',
  tapToEdit: 'Double tap to edit',
  tapToDelete: 'Double tap to delete',
  tapToSave: 'Double tap to save',
  tapToCancel: 'Double tap to cancel',
  tapToClose: 'Double tap to close',
  swipeToNavigate: 'Swipe left or right to navigate between items',
  tapToExpand: 'Double tap to expand',
  tapToCollapse: 'Double tap to collapse',
};

/**
 * Get accessibility label for score/rating
 */
export function getScoreAccessibilityLabel(score: number, maxScore: number = 5): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) {
    return `${score} out of ${maxScore}, excellent`;
  } else if (percentage >= 60) {
    return `${score} out of ${maxScore}, good`;
  } else if (percentage >= 40) {
    return `${score} out of ${maxScore}, average`;
  } else {
    return `${score} out of ${maxScore}, below average`;
  }
}

/**
 * Format date for accessibility
 */
export function getDateAccessibilityLabel(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Get accessibility label for list position
 */
export function getListPositionLabel(index: number, total: number): string {
  return `Item ${index + 1} of ${total}`;
}

/**
 * Combine multiple accessibility labels
 */
export function combineAccessibilityLabels(...labels: (string | undefined)[]): string {
  return labels.filter(Boolean).join(', ');
}

/**
 * Get accessibility hint for navigation
 */
export function getNavigationHint(destination: string): string {
  return `Double tap to navigate to ${destination}`;
}

/**
 * Set focus to an element (for screen reader navigation)
 */
export function setAccessibilityFocus(reactTag: number): void {
  try {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  } catch (error) {
    console.error('[Accessibility] Error setting accessibility focus:', error);
  }
}
