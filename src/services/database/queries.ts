/**
 * Database Queries
 *
 * Common SQL queries and query builders for database operations.
 * These are used by the service layer (sessionService, analyticsService, etc.)
 */

/**
 * Session queries
 */
export const sessionQueries = {
  // Get all sessions, ordered by creation date (newest first)
  getAllSessions: `
    SELECT * FROM sessions
    ORDER BY created_at DESC
  `,

  // Get single session by ID
  getSessionById: `
    SELECT * FROM sessions
    WHERE id = ?
  `,

  // Get sessions by type
  getSessionsByType: `
    SELECT * FROM sessions
    WHERE session_type = ?
    ORDER BY created_at DESC
  `,

  // Get sessions by date range
  getSessionsByDateRange: `
    SELECT * FROM sessions
    WHERE created_at BETWEEN ? AND ?
    ORDER BY created_at DESC
  `,

  // Insert new session
  insertSession: `
    INSERT INTO sessions (id, created_at, updated_at, mode, session_type, notes, tags, sync_status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // Update session
  updateSession: `
    UPDATE sessions
    SET updated_at = ?, notes = ?, tags = ?, sync_status = ?
    WHERE id = ?
  `,

  // Delete session (will cascade to coffees, cups, flavors)
  deleteSession: `
    DELETE FROM sessions
    WHERE id = ?
  `,
} as const;

/**
 * Coffee queries
 */
export const coffeeQueries = {
  // Get all coffees for a session
  getCoffeesBySession: `
    SELECT * FROM coffees
    WHERE session_id = ?
    ORDER BY id ASC
  `,

  // Get single coffee by ID
  getCoffeeById: `
    SELECT * FROM coffees
    WHERE id = ?
  `,

  // Insert new coffee
  insertCoffee: `
    INSERT INTO coffees (id, session_id, name, roaster, origin, brew_method, roast_level, roast_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // Update coffee
  updateCoffee: `
    UPDATE coffees
    SET name = ?, roaster = ?, origin = ?, brew_method = ?, roast_level = ?, roast_date = ?
    WHERE id = ?
  `,

  // Delete coffee (will cascade to cups, flavors)
  deleteCoffee: `
    DELETE FROM coffees
    WHERE id = ?
  `,
} as const;

/**
 * Cup queries
 */
export const cupQueries = {
  // Get all cups for a coffee
  getCupsByCoffee: `
    SELECT * FROM cups
    WHERE coffee_id = ?
    ORDER BY position ASC
  `,

  // Get single cup by ID
  getCupById: `
    SELECT * FROM cups
    WHERE id = ?
  `,

  // Insert new cup
  insertCup: `
    INSERT INTO cups (id, coffee_id, position, acidity, sweetness, body, clarity, finish, enjoyment, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // Update cup scores
  updateCupScores: `
    UPDATE cups
    SET acidity = ?, sweetness = ?, body = ?, clarity = ?, finish = ?, enjoyment = ?
    WHERE id = ?
  `,

  // Update cup notes
  updateCupNotes: `
    UPDATE cups
    SET notes = ?
    WHERE id = ?
  `,

  // Delete cup (will cascade to flavors)
  deleteCup: `
    DELETE FROM cups
    WHERE id = ?
  `,
} as const;

/**
 * Selected flavor queries
 */
export const flavorQueries = {
  // Get all flavors for a cup
  getFlavorsByCup: `
    SELECT * FROM selected_flavors
    WHERE cup_id = ?
    ORDER BY dominant DESC, intensity DESC
  `,

  // Get flavor frequency across all sessions
  getFlavorFrequency: `
    SELECT flavor_id, COUNT(*) as count, AVG(intensity) as avg_intensity
    FROM selected_flavors
    GROUP BY flavor_id
    ORDER BY count DESC
  `,

  // Get flavor frequency for specific session
  getFlavorFrequencyBySession: `
    SELECT sf.flavor_id, COUNT(*) as count, AVG(sf.intensity) as avg_intensity
    FROM selected_flavors sf
    JOIN cups c ON sf.cup_id = c.id
    JOIN coffees co ON c.coffee_id = co.id
    WHERE co.session_id = ?
    GROUP BY sf.flavor_id
    ORDER BY count DESC
  `,

  // Insert new selected flavor
  insertFlavor: `
    INSERT INTO selected_flavors (cup_id, flavor_id, intensity, dominant)
    VALUES (?, ?, ?, ?)
  `,

  // Update flavor intensity
  updateFlavorIntensity: `
    UPDATE selected_flavors
    SET intensity = ?
    WHERE cup_id = ? AND flavor_id = ?
  `,

  // Toggle flavor dominant
  updateFlavorDominant: `
    UPDATE selected_flavors
    SET dominant = ?
    WHERE cup_id = ? AND flavor_id = ?
  `,

  // Delete flavor
  deleteFlavor: `
    DELETE FROM selected_flavors
    WHERE cup_id = ? AND flavor_id = ?
  `,

  // Delete all flavors for a cup
  deleteFlavorsByCup: `
    DELETE FROM selected_flavors
    WHERE cup_id = ?
  `,
} as const;

/**
 * Analytics queries
 */
export const analyticsQueries = {
  // Get average scores for a coffee (across all cups)
  getAverageScoresByCoffee: `
    SELECT
      AVG(acidity) as avg_acidity,
      AVG(sweetness) as avg_sweetness,
      AVG(body) as avg_body,
      AVG(clarity) as avg_clarity,
      AVG(finish) as avg_finish,
      AVG(enjoyment) as avg_enjoyment,
      COUNT(*) as cup_count
    FROM cups
    WHERE coffee_id = ?
  `,

  // Get score variance for uniformity analysis (table cupping)
  getScoreVarianceByCoffee: `
    SELECT
      AVG(acidity) as avg_acidity,
      AVG(sweetness) as avg_sweetness,
      AVG(body) as avg_body,
      AVG(clarity) as avg_clarity,
      AVG(finish) as avg_finish,
      AVG(enjoyment) as avg_enjoyment
    FROM cups
    WHERE coffee_id = ?
  `,

  // Get total unique flavors count
  getUniqueFlavorsCount: `
    SELECT COUNT(DISTINCT flavor_id) as unique_count
    FROM selected_flavors
  `,

  // Get most common flavors (top N)
  getTopFlavors: `
    SELECT flavor_id, COUNT(*) as count
    FROM selected_flavors
    GROUP BY flavor_id
    ORDER BY count DESC
    LIMIT ?
  `,
} as const;
