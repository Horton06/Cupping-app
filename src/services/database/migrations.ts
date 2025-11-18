/**
 * Database Migrations
 *
 * Manages database schema versioning and migrations.
 * Each migration is applied sequentially and tracked.
 */

import * as SQLite from 'expo-sqlite';

interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * All database migrations in order.
 * Each migration must have a unique version number.
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db: SQLite.SQLiteDatabase) => {
      console.log('[Migration v1] Creating initial schema...');

      // Create all tables with proper constraints and foreign keys
      const queries = [
        // Sessions table
        {
          sql: `CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            mode TEXT NOT NULL CHECK(mode IN ('taste', 'pro')),
            session_type TEXT NOT NULL CHECK(session_type IN ('single-coffee', 'multi-coffee', 'table-cupping')),
            notes TEXT,
            tags TEXT,
            sync_status TEXT DEFAULT 'local-only',
            user_id TEXT
          );`,
          args: [],
        },
        // Coffees table
        {
          sql: `CREATE TABLE IF NOT EXISTS coffees (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            name TEXT NOT NULL,
            roaster TEXT,
            origin TEXT,
            brew_method TEXT,
            roast_level TEXT,
            roast_date TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
          );`,
          args: [],
        },
        // Cups table
        {
          sql: `CREATE TABLE IF NOT EXISTS cups (
            id TEXT PRIMARY KEY,
            coffee_id TEXT NOT NULL,
            position INTEGER NOT NULL,
            acidity INTEGER CHECK(acidity BETWEEN 1 AND 5),
            sweetness INTEGER CHECK(sweetness BETWEEN 1 AND 5),
            body INTEGER CHECK(body BETWEEN 1 AND 5),
            clarity INTEGER CHECK(clarity BETWEEN 1 AND 5),
            finish INTEGER CHECK(finish BETWEEN 1 AND 5),
            enjoyment INTEGER CHECK(enjoyment BETWEEN 1 AND 5),
            notes TEXT,
            FOREIGN KEY (coffee_id) REFERENCES coffees(id) ON DELETE CASCADE
          );`,
          args: [],
        },
        // Selected flavors table
        {
          sql: `CREATE TABLE IF NOT EXISTS selected_flavors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cup_id TEXT NOT NULL,
            flavor_id INTEGER NOT NULL,
            intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 5),
            dominant INTEGER DEFAULT 0 CHECK(dominant IN (0, 1)),
            FOREIGN KEY (cup_id) REFERENCES cups(id) ON DELETE CASCADE
          );`,
          args: [],
        },
        // Indexes
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_coffees_session ON coffees(session_id);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_cups_coffee ON cups(coffee_id);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_flavors_cup ON selected_flavors(cup_id);',
          args: [],
        },
        {
          sql: 'CREATE INDEX IF NOT EXISTS idx_flavors_flavor_id ON selected_flavors(flavor_id);',
          args: [],
        },
      ];

      await db.execAsync(queries, false);
      console.log('[Migration v1] Schema created successfully');
    },
  },
  // Future migrations will be added here
  // Example:
  // {
  //   version: 2,
  //   up: async (db: SQLite.SQLiteDatabase) => {
  //     // Add new column or table
  //     await db.execAsync(`ALTER TABLE sessions ADD COLUMN new_field TEXT;`);
  //   },
  // },
];

/**
 * Run all pending migrations.
 * Creates migration tracking table if it doesn't exist.
 * Applies migrations in order, tracking each one.
 *
 * @param db - SQLite database instance
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create migration tracking table
  await db.execAsync(
    [
      {
        sql: `CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL
        );`,
        args: [],
      },
    ],
    false
  );

  // Get current version
  const currentVersion = await getCurrentVersion(db);
  console.log('[Migrations] Current version:', currentVersion);

  // Run pending migrations
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`[Migrations] Applying migration v${migration.version}...`);

      // Run migration in a transaction for safety
      await db.transactionAsync(async (tx) => {
        await migration.up(db);

        // Record migration
        await tx.executeSqlAsync(
          'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
          [migration.version, new Date().toISOString()]
        );
      }, false);

      console.log(`[Migrations] Migration v${migration.version} applied successfully`);
    }
  }

  const finalVersion = MIGRATIONS[MIGRATIONS.length - 1]?.version || 0;
  console.log('[Migrations] Database is up to date (v' + finalVersion + ')');
}

/**
 * Get current database version.
 *
 * @param db - SQLite database instance
 * @returns Current migration version
 */
export async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    // Use transaction to query
    let version = 0;
    await db.transactionAsync(async (tx) => {
      const result = await tx.executeSqlAsync('SELECT MAX(version) as version FROM migrations', []);
      if (result.rows && result.rows.length > 0) {
        version = result.rows[0].version || 0;
      }
    }, true);
    return version;
  } catch (error) {
    // migrations table doesn't exist yet
    return 0;
  }
}
