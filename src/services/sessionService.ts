/**
 * Session Service
 *
 * Business logic layer for managing coffee tasting sessions.
 * Handles CRUD operations with SQLite persistence.
 */

import { getDatabase } from './database/connection';
import { sessionQueries, coffeeQueries, cupQueries, flavorQueries } from './database/queries';
import type {
  SessionRow,
  CoffeeRow,
  CupRow,
  SelectedFlavorRow,
} from './database/types';
import type {
  Session,
  SessionType,
  SessionMode,
  CoffeeEntry,
  Cup,
  StructuralScores,
  ScoreValue,
  CoffeeFormData,
  SessionFilters,
} from '../types/session.types';
import type { SelectedFlavor } from '../types/flavor.types';
import { generateUUID } from '../utils/uuid';

/**
 * Session Service - Manages tasting sessions
 */
class SessionService {
  /**
   * Create a new session with the specified type.
   * Initializes empty coffee entries based on type.
   *
   * @param type - Session type (single-coffee, multi-coffee, table-cupping)
   * @returns Promise<Session> - Created session
   */
  async createSession(type: SessionType): Promise<Session> {
    const db = await getDatabase();
    const sessionId = generateUUID();
    const now = new Date().toISOString();

    await db.transactionAsync(async tx => {
      // Insert session
      await tx.executeSqlAsync(sessionQueries.insertSession, [
        sessionId,
        now,
        now,
        'taste', // mode
        type,
        null, // notes
        null, // tags
        'local-only', // sync_status
        null, // user_id
      ]);

      // Create default coffee entry
      const coffeeId = generateUUID();
      await tx.executeSqlAsync(coffeeQueries.insertCoffee, [
        coffeeId,
        sessionId,
        'Untitled Coffee', // name
        null, // roaster
        null, // origin
        null, // brew_method
        null, // roast_level
        null, // roast_date
      ]);

      // Create default cup(s) based on session type
      const cupsToCreate = type === 'table-cupping' ? 5 : 1;
      for (let i = 1; i <= cupsToCreate; i++) {
        const cupId = generateUUID();
        await tx.executeSqlAsync(cupQueries.insertCup, [
          cupId,
          coffeeId,
          i, // position
          null, // acidity
          null, // sweetness
          null, // body
          null, // clarity
          null, // finish
          null, // enjoyment
          null, // notes
        ]);
      }
    }, false);

    console.log(`[SessionService] Created session ${sessionId} (${type})`);

    // Return the created session
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Failed to create session');
    }
    return session;
  }

  /**
   * Retrieve a session by ID with all related data.
   *
   * @param id - Session ID
   * @returns Promise<Session | null> - Session or null if not found
   */
  async getSession(id: string): Promise<Session | null> {
    const db = await getDatabase();

    // Fetch session
    let sessionRow: SessionRow | null = null;
    await db.transactionAsync(async tx => {
      const result = await tx.executeSqlAsync(sessionQueries.getSessionById, [id]);
      if (result.rows && result.rows.length > 0) {
        sessionRow = result.rows[0] as SessionRow;
      }
    }, true);

    if (!sessionRow) {
      return null;
    }

    // Type assertion to help TypeScript - sessionRow is definitely SessionRow here
    const session = sessionRow as SessionRow;

    // Fetch coffees
    let coffeeRows: CoffeeRow[] = [];
    await db.transactionAsync(async tx => {
      const result = await tx.executeSqlAsync(coffeeQueries.getCoffeesBySession, [id]);
      if (result.rows) {
        coffeeRows = result.rows as CoffeeRow[];
      }
    }, true);

    // Fetch cups and flavors for each coffee
    const coffees: CoffeeEntry[] = [];
    for (const coffeeRow of coffeeRows) {
      let cupRows: CupRow[] = [];
      await db.transactionAsync(async tx => {
        const result = await tx.executeSqlAsync(cupQueries.getCupsByCoffee, [coffeeRow.id]);
        if (result.rows) {
          cupRows = result.rows as CupRow[];
        }
      }, true);

      const cups: Cup[] = [];
      for (const cupRow of cupRows) {
        let flavorRows: SelectedFlavorRow[] = [];
        await db.transactionAsync(async tx => {
          const result = await tx.executeSqlAsync(flavorQueries.getFlavorsByCup, [cupRow.id]);
          if (result.rows) {
            flavorRows = result.rows as SelectedFlavorRow[];
          }
        }, true);

        cups.push({
          cupId: cupRow.id,
          position: cupRow.position,
          ratings: {
            acidity: (cupRow.acidity || 3) as ScoreValue,
            sweetness: (cupRow.sweetness || 3) as ScoreValue,
            body: (cupRow.body || 3) as ScoreValue,
            clarity: (cupRow.clarity || 3) as ScoreValue,
            finish: (cupRow.finish || 3) as ScoreValue,
            enjoyment: cupRow.enjoyment ? (cupRow.enjoyment as ScoreValue) : undefined,
          },
          flavors: flavorRows.map(f => ({
            flavorId: f.flavor_id,
            intensity: f.intensity as ScoreValue,
            dominant: f.dominant === 1,
          })),
          notes: cupRow.notes || undefined,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
        });
      }

      coffees.push({
        coffeeId: coffeeRow.id,
        name: coffeeRow.name,
        roaster: coffeeRow.roaster || undefined,
        origin: coffeeRow.origin || undefined,
        brewMethod: coffeeRow.brew_method || undefined,
        roastLevel: coffeeRow.roast_level as any || undefined,
        roastDate: coffeeRow.roast_date || undefined,
        cups,
      });
    }

    return {
      id: session.id,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      mode: session.mode as SessionMode,
      sessionType: session.session_type as SessionType,
      coffees,
      notes: session.notes || undefined,
      tags: session.tags ? JSON.parse(session.tags) : undefined,
      syncStatus: (session.sync_status as any) || undefined,
      userId: session.user_id || undefined,
    };
  }

  /**
   * Update an existing session.
   * Performs deep merge of session data.
   *
   * @param session - Session to update
   */
  async updateSession(session: Session): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.transactionAsync(async tx => {
      // Update session metadata
      await tx.executeSqlAsync(sessionQueries.updateSession, [
        now, // updated_at
        session.notes || null,
        session.tags ? JSON.stringify(session.tags) : null,
        session.syncStatus || 'local-only',
        session.id,
      ]);

      // Update coffees
      for (const coffee of session.coffees) {
        await tx.executeSqlAsync(coffeeQueries.updateCoffee, [
          coffee.name,
          coffee.roaster || null,
          coffee.origin || null,
          coffee.brewMethod || null,
          coffee.roastLevel || null,
          coffee.roastDate || null,
          coffee.coffeeId,
        ]);

        // Update cups
        for (const cup of coffee.cups) {
          await tx.executeSqlAsync(cupQueries.updateCupScores, [
            cup.ratings.acidity,
            cup.ratings.sweetness,
            cup.ratings.body,
            cup.ratings.clarity,
            cup.ratings.finish,
            cup.ratings.enjoyment || null,
            cup.cupId,
          ]);

          await tx.executeSqlAsync(cupQueries.updateCupNotes, [
            cup.notes || null,
            cup.cupId,
          ]);

          // Update flavors - delete all and re-insert
          await tx.executeSqlAsync(flavorQueries.deleteFlavorsByCup, [cup.cupId]);

          for (const flavor of cup.flavors) {
            await tx.executeSqlAsync(flavorQueries.insertFlavor, [
              cup.cupId,
              flavor.flavorId,
              flavor.intensity,
              flavor.dominant ? 1 : 0,
            ]);
          }
        }
      }
    }, false);

    console.log(`[SessionService] Updated session ${session.id}`);
  }

  /**
   * Soft delete a session (mark as deleted, don't remove from DB).
   * Note: Currently performs hard delete. Soft delete requires schema change.
   *
   * @param id - Session ID
   */
  async deleteSession(id: string): Promise<void> {
    // For now, perform hard delete
    // In future, add a 'deleted_at' column and mark as deleted
    await this.hardDeleteSession(id);
  }

  /**
   * Permanently remove a session from database.
   *
   * @param id - Session ID
   */
  async hardDeleteSession(id: string): Promise<void> {
    const db = await getDatabase();

    await db.transactionAsync(async tx => {
      await tx.executeSqlAsync(sessionQueries.deleteSession, [id]);
    }, false);

    console.log(`[SessionService] Deleted session ${id}`);
  }

  /**
   * Get all sessions, optionally filtered and sorted.
   *
   * @param filters - Optional filter criteria
   * @returns Promise<Session[]> - Array of sessions
   */
  async getAllSessions(filters?: SessionFilters): Promise<Session[]> {
    const db = await getDatabase();

    // Build query based on filters
    let query = 'SELECT * FROM sessions WHERE 1=1';
    const params: any[] = [];

    if (filters?.type) {
      query += ' AND session_type = ?';
      params.push(filters.type);
    }

    if (filters?.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';
    const sortColumn = sortBy === 'createdAt' ? 'created_at' : 'updated_at';
    query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

    // Pagination
    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    let sessionRows: SessionRow[] = [];
    await db.transactionAsync(async tx => {
      const result = await tx.executeSqlAsync(query, params);
      if (result.rows) {
        sessionRows = result.rows as SessionRow[];
      }
    }, true);

    // Load full session data for each
    const sessions: Session[] = [];
    for (const row of sessionRows) {
      const session = await this.getSession(row.id);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Duplicate an existing session (new ID, same data).
   *
   * @param id - Session ID to duplicate
   * @returns Promise<Session> - Duplicated session
   */
  async duplicateSession(id: string): Promise<Session> {
    const originalSession = await this.getSession(id);
    if (!originalSession) {
      throw new Error(`Session ${id} not found`);
    }

    const db = await getDatabase();
    const newSessionId = generateUUID();
    const now = new Date().toISOString();

    await db.transactionAsync(async tx => {
      // Insert new session
      await tx.executeSqlAsync(sessionQueries.insertSession, [
        newSessionId,
        now,
        now,
        originalSession.mode,
        originalSession.sessionType,
        originalSession.notes || null,
        originalSession.tags ? JSON.stringify(originalSession.tags) : null,
        'local-only',
        null,
      ]);

      // Duplicate coffees
      for (const coffee of originalSession.coffees) {
        const newCoffeeId = generateUUID();
        await tx.executeSqlAsync(coffeeQueries.insertCoffee, [
          newCoffeeId,
          newSessionId,
          coffee.name,
          coffee.roaster || null,
          coffee.origin || null,
          coffee.brewMethod || null,
          coffee.roastLevel || null,
          coffee.roastDate || null,
        ]);

        // Duplicate cups
        for (const cup of coffee.cups) {
          const newCupId = generateUUID();
          await tx.executeSqlAsync(cupQueries.insertCup, [
            newCupId,
            newCoffeeId,
            cup.position,
            cup.ratings.acidity,
            cup.ratings.sweetness,
            cup.ratings.body,
            cup.ratings.clarity,
            cup.ratings.finish,
            cup.ratings.enjoyment || null,
            cup.notes || null,
          ]);

          // Duplicate flavors
          for (const flavor of cup.flavors) {
            await tx.executeSqlAsync(flavorQueries.insertFlavor, [
              newCupId,
              flavor.flavorId,
              flavor.intensity,
              flavor.dominant ? 1 : 0,
            ]);
          }
        }
      }
    }, false);

    console.log(`[SessionService] Duplicated session ${id} → ${newSessionId}`);

    const duplicatedSession = await this.getSession(newSessionId);
    if (!duplicatedSession) {
      throw new Error('Failed to duplicate session');
    }
    return duplicatedSession;
  }

  /**
   * Add a coffee to an existing session.
   *
   * @param sessionId - Session ID
   * @param coffee - Coffee form data
   * @returns Promise<CoffeeEntry> - Created coffee entry
   */
  async addCoffeeToSession(
    sessionId: string,
    coffee: CoffeeFormData
  ): Promise<CoffeeEntry> {
    const db = await getDatabase();
    const coffeeId = generateUUID();
    const cupId = generateUUID();

    await db.transactionAsync(async tx => {
      // Insert coffee
      await tx.executeSqlAsync(coffeeQueries.insertCoffee, [
        coffeeId,
        sessionId,
        coffee.name,
        coffee.roaster || null,
        coffee.origin || null,
        coffee.brewMethod || null,
        coffee.roastLevel || null,
        coffee.roastDate ? coffee.roastDate.toISOString() : null,
      ]);

      // Insert default cup
      await tx.executeSqlAsync(cupQueries.insertCup, [
        cupId,
        coffeeId,
        1, // position
        null, // acidity
        null, // sweetness
        null, // body
        null, // clarity
        null, // finish
        null, // enjoyment
        null, // notes
      ]);

      // Update session updated_at
      await tx.executeSqlAsync(
        'UPDATE sessions SET updated_at = ? WHERE id = ?',
        [new Date().toISOString(), sessionId]
      );
    }, false);

    console.log(`[SessionService] Added coffee ${coffeeId} to session ${sessionId}`);

    // Return the coffee entry
    const session = await this.getSession(sessionId);
    const coffeeEntry = session?.coffees.find(c => c.coffeeId === coffeeId);
    if (!coffeeEntry) {
      throw new Error('Failed to add coffee');
    }
    return coffeeEntry;
  }

  /**
   * Remove a coffee from a session.
   *
   * @param sessionId - Session ID
   * @param coffeeId - Coffee ID
   */
  async removeCoffeeFromSession(sessionId: string, coffeeId: string): Promise<void> {
    const db = await getDatabase();

    await db.transactionAsync(async tx => {
      await tx.executeSqlAsync(coffeeQueries.deleteCoffee, [coffeeId]);

      // Update session updated_at
      await tx.executeSqlAsync(
        'UPDATE sessions SET updated_at = ? WHERE id = ?',
        [new Date().toISOString(), sessionId]
      );
    }, false);

    console.log(`[SessionService] Removed coffee ${coffeeId} from session ${sessionId}`);
  }

  /**
   * Update structural scores for a specific cup.
   *
   * @param cupId - Cup ID
   * @param scores - Partial structural scores to update
   */
  async updateCupScores(cupId: string, scores: Partial<StructuralScores>): Promise<void> {
    const db = await getDatabase();

    // Get current cup data
    let currentCup: CupRow | null = null;
    await db.transactionAsync(async tx => {
      const result = await tx.executeSqlAsync(cupQueries.getCupById, [cupId]);
      if (result.rows && result.rows.length > 0) {
        currentCup = result.rows[0] as CupRow;
      }
    }, true);

    if (!currentCup) {
      throw new Error(`Cup ${cupId} not found`);
    }

    // Type assertion to help TypeScript
    const cup = currentCup as CupRow;

    // Merge scores
    const updatedScores = {
      acidity: scores.acidity ?? cup.acidity ?? 3,
      sweetness: scores.sweetness ?? cup.sweetness ?? 3,
      body: scores.body ?? cup.body ?? 3,
      clarity: scores.clarity ?? cup.clarity ?? 3,
      finish: scores.finish ?? cup.finish ?? 3,
      enjoyment: scores.enjoyment ?? cup.enjoyment ?? null,
    };

    await db.transactionAsync(async tx => {
      await tx.executeSqlAsync(cupQueries.updateCupScores, [
        updatedScores.acidity,
        updatedScores.sweetness,
        updatedScores.body,
        updatedScores.clarity,
        updatedScores.finish,
        updatedScores.enjoyment,
        cupId,
      ]);
    }, false);

    console.log(`[SessionService] Updated scores for cup ${cupId}`);
  }

  /**
   * Update selected flavors for a specific cup.
   *
   * @param cupId - Cup ID
   * @param flavors - Array of selected flavors
   */
  async updateCupFlavors(cupId: string, flavors: SelectedFlavor[]): Promise<void> {
    const db = await getDatabase();

    await db.transactionAsync(async tx => {
      // Delete all existing flavors for this cup
      await tx.executeSqlAsync(flavorQueries.deleteFlavorsByCup, [cupId]);

      // Insert new flavors
      for (const flavor of flavors) {
        await tx.executeSqlAsync(flavorQueries.insertFlavor, [
          cupId,
          flavor.flavorId,
          flavor.intensity,
          flavor.dominant ? 1 : 0,
        ]);
      }
    }, false);

    console.log(`[SessionService] Updated flavors for cup ${cupId}`);
  }
}

// Export singleton instance
export const sessionService = new SessionService();
export default sessionService;
