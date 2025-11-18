/**
 * Database Row Types
 *
 * TypeScript interfaces for database rows.
 * These match the SQL schema exactly (snake_case, nullable fields).
 */

/**
 * Session table row
 */
export interface SessionRow {
  id: string;
  created_at: string;
  updated_at: string;
  mode: string; // 'taste' | 'pro'
  session_type: string; // 'single-coffee' | 'multi-coffee' | 'table-cupping'
  notes: string | null;
  tags: string | null; // JSON stringified array
  sync_status: string; // 'local-only' | 'synced' | 'pending' | 'conflict'
  user_id: string | null; // Nullable for guest mode (Phase 1)
}

/**
 * Coffee table row
 */
export interface CoffeeRow {
  id: string;
  session_id: string;
  name: string;
  roaster: string | null;
  origin: string | null;
  brew_method: string | null;
  roast_level: string | null; // 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  roast_date: string | null; // ISO8601 date string
}

/**
 * Cup table row
 */
export interface CupRow {
  id: string;
  coffee_id: string;
  position: number; // 1-5 for table cupping, always 1 for single/multi
  acidity: number | null; // 1-5
  sweetness: number | null; // 1-5
  body: number | null; // 1-5
  clarity: number | null; // 1-5
  finish: number | null; // 1-5
  enjoyment: number | null; // 1-5
  notes: string | null;
}

/**
 * Selected flavor table row
 */
export interface SelectedFlavorRow {
  id: number; // Auto-increment
  cup_id: string;
  flavor_id: number; // References flavor in flavor-descriptors.json
  intensity: number; // 1-5
  dominant: number; // 0 or 1 (SQLite boolean)
}

/**
 * Migration tracking table row
 */
export interface MigrationRow {
  version: number;
  applied_at: string; // ISO8601
}
