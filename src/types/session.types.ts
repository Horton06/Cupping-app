/**
 * Session Types
 *
 * TypeScript interfaces for coffee tasting sessions.
 */

import type { SelectedFlavor } from './flavor.types';

/**
 * Score value type (1-5 scale)
 */
export type ScoreValue = 1 | 2 | 3 | 4 | 5;

/**
 * Structural scores for a cup of coffee
 */
export interface StructuralScores {
  acidity: ScoreValue;
  sweetness: ScoreValue;
  body: ScoreValue;
  clarity: ScoreValue;
  finish: ScoreValue;
  enjoyment?: ScoreValue; // Optional overall rating
}

/**
 * SCA-equivalent scores (converted from 1-5 to 6-10 scale)
 * Formula: SCA = 5 + score
 */
export interface SCAScores {
  acidity: number; // 6-10
  sweetness: number; // 6-10
  body: number; // 6-10
  clarity: number; // 6-10
  finish: number; // 6-10
  enjoyment?: number; // 6-10
  total?: number; // Sum of all scores
  average?: number; // Average score
}

/**
 * Attribute metadata for UI rendering
 */
export interface ScoreAttribute {
  key: keyof StructuralScores;
  label: string;
  leftLabel: string; // Low end descriptor
  rightLabel: string; // High end descriptor
  description: string;
  helpText: Record<ScoreValue, string>; // Long-press definitions
}

/**
 * Cup (for table cupping and all tastings)
 */
export interface Cup {
  cupId: string;
  position: number; // 1-5 for table cupping, 1 for single/multi
  ratings: StructuralScores;
  flavors: SelectedFlavor[];
  notes?: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

/**
 * Roast level options
 */
export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

/**
 * Coffee entry in a session
 */
export interface CoffeeEntry {
  coffeeId: string;
  name: string;
  roaster?: string;
  origin?: string;
  brewMethod?: string;
  roastLevel?: RoastLevel;
  roastDate?: string; // ISO8601 date
  cups: Cup[]; // 1+ cups for table cupping, exactly 1 for single/multi
}

/**
 * Session mode
 */
export type SessionMode = 'taste' | 'pro';

/**
 * Session type
 */
export type SessionType = 'single-coffee' | 'multi-coffee' | 'table-cupping';

/**
 * Sync status
 */
export type SyncStatus = 'local-only' | 'synced' | 'pending' | 'conflict';

/**
 * Complete session object
 */
export interface Session {
  id: string; // UUID
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  mode: SessionMode;
  sessionType: SessionType;
  coffees: CoffeeEntry[];
  notes?: string;
  tags?: string[];
  syncStatus?: SyncStatus;
  userId?: string | null; // Nullable for guest mode (Phase 1)
}

/**
 * Session with computed analytics
 */
export interface SessionWithStats extends Session {
  stats: {
    totalFlavors: number;
    averageScores: StructuralScores;
    topCategories: string[];
    duration?: number; // Minutes spent
  };
}

/**
 * Session flow state machine
 */
export type SessionFlowStep =
  | 'session-type-select'
  | 'coffee-setup'
  | 'flavor-selection'
  | 'structure-scoring'
  | 'notes'
  | 'summary';

/**
 * Session flow state
 */
export interface SessionFlowState {
  currentStep: SessionFlowStep;
  completedSteps: SessionFlowStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Coffee form data for session creation
 */
export interface CoffeeFormData {
  name: string;
  roaster?: string;
  origin?: string;
  brewMethod?: string;
  roastLevel?: RoastLevel;
  roastDate?: Date;
}

/**
 * Session filter options
 */
export interface SessionFilters {
  type?: SessionType;
  startDate?: string; // ISO8601
  endDate?: string; // ISO8601
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form state
 */
export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  touched: Set<keyof T>;
  isValid: boolean;
}
