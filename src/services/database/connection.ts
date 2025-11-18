/**
 * Database Connection Module
 *
 * Manages SQLite database connection and initialization.
 * Ensures database is created and migrated before use.
 */

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const DB_NAME = 'cupper.db';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Get database instance, initializing if needed.
 * Runs migrations on first access.
 *
 * @returns Promise<SQLiteDatabase> - Database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  // Prevent multiple simultaneous initializations
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    console.log('[Database] Opening database:', DB_NAME);
    db = SQLite.openDatabase(DB_NAME);
    console.log('[Database] Database opened successfully');

    console.log('[Database] Running migrations...');
    await runMigrations(db);
    console.log('[Database] Migrations complete');

    return db;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

/**
 * Close database connection.
 * Should be called on app shutdown (cleanup).
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    console.log('[Database] Closing database...');
    await db.closeAsync();
    db = null;
    console.log('[Database] Database closed');
  }
}

/**
 * Reset database (for testing/development only).
 * WARNING: This will delete all data!
 */
export async function resetDatabase(): Promise<void> {
  console.warn('[Database] Resetting database - ALL DATA WILL BE LOST');

  if (db) {
    await db.closeAsync();
    await db.deleteAsync();
    db = null;
  }

  // Re-initialize
  await getDatabase();
  console.log('[Database] Database reset complete');
}
