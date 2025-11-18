/**
 * Sync Service (Stub for Phase 2)
 *
 * Provides sync interface for cloud synchronization.
 * All methods return "not implemented" errors in Phase 1.
 * Full implementation planned for Phase 2 with authentication.
 */

/**
 * Sync result interface
 */
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: string[]; // Session IDs with conflicts
  error?: string;
}

/**
 * Conflict resolution strategy
 */
export type ConflictStrategy =
  | 'local-wins' // Keep local version
  | 'remote-wins' // Overwrite with remote version
  | 'merge' // Combine both versions (manual)
  | 'ask-user'; // Show UI for user decision

/**
 * Sync service interface
 */
export interface ISyncService {
  /**
   * Sync all local sessions with cloud
   */
  syncAll(): Promise<SyncResult>;

  /**
   * Sync a specific session
   */
  syncSession(sessionId: string): Promise<SyncResult>;

  /**
   * Resolve a conflict for a session
   */
  resolveConflict(sessionId: string, strategy: ConflictStrategy): Promise<void>;

  /**
   * Check if sync is available (requires authentication)
   */
  canSync(): Promise<boolean>;

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): Promise<Date | null>;
}

/**
 * Sync Service Implementation (Stub)
 *
 * This is a stub implementation for Phase 1.
 * All methods return appropriate "not implemented" responses.
 */
class SyncService implements ISyncService {
  async syncAll(): Promise<SyncResult> {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      error: 'Sync not implemented in Phase 1. Coming in Phase 2 with authentication.',
    };
  }

  async syncSession(_sessionId: string): Promise<SyncResult> {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      error: 'Sync not implemented in Phase 1. Coming in Phase 2 with authentication.',
    };
  }

  async resolveConflict(
    _sessionId: string,
    _strategy: ConflictStrategy
  ): Promise<void> {
    throw new Error(
      'Conflict resolution not implemented in Phase 1. Coming in Phase 2 with authentication.'
    );
  }

  async canSync(): Promise<boolean> {
    // Always false in Phase 1 (guest mode only)
    return false;
  }

  async getLastSyncTime(): Promise<Date | null> {
    // No sync in Phase 1
    return null;
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;

/**
 * PHASE 2 SYNC STRATEGY DOCUMENTATION
 *
 * Approach: Last-Write-Wins with Conflict Detection
 *
 * 1. Session Sync Status Fields (already in database):
 *    - 'local-only': Never synced to cloud
 *    - 'synced': Up to date with cloud
 *    - 'pending': Local changes not yet synced
 *    - 'conflict': Remote changes conflict with local
 *
 * 2. Sync Process Flow:
 *    a) Upload Phase:
 *       - Find all sessions with sync_status = 'pending'
 *       - Upload to cloud (Firebase/Supabase)
 *       - Mark as 'synced' on success
 *
 *    b) Download Phase:
 *       - Fetch all remote sessions modified after last sync
 *       - Compare timestamps (updated_at) with local
 *       - If remote newer: update local
 *       - If local newer: mark as 'pending' for re-upload
 *       - If both modified: mark as 'conflict'
 *
 *    c) Conflict Resolution:
 *       - Present UI showing both versions
 *       - User chooses: local-wins, remote-wins, or manual merge
 *       - Apply strategy and sync result
 *
 * 3. Conflict Resolution Strategies:
 *    - 'local-wins': Keep local version, overwrite remote
 *    - 'remote-wins': Discard local changes, use remote
 *    - 'merge': Show diff UI, allow manual combination
 *    - 'ask-user': Present dialog for user decision
 *
 * 4. Backend Implementation (Phase 2):
 *    Technology Options:
 *    - Firebase Firestore (recommended)
 *      * Real-time listeners for instant sync
 *      * Built-in authentication
 *      * Offline persistence
 *      * Query capabilities
 *
 *    - Supabase (alternative)
 *      * PostgreSQL backend
 *      * Real-time subscriptions
 *      * Row-level security
 *      * Open source
 *
 * 5. Data Structure:
 *    sessions/
 *      {userId}/
 *        {sessionId}/
 *          - id: string
 *          - created_at: timestamp
 *          - updated_at: timestamp
 *          - mode: 'taste' | 'pro'
 *          - session_type: 'single-coffee' | 'multi-coffee' | 'table-cupping'
 *          - coffees: array<Coffee>
 *          - notes: string
 *          - tags: array<string>
 *          - sync_status: 'synced' | 'pending' | 'conflict'
 *          - version: number (for optimistic locking)
 *
 * 6. Optimistic Updates:
 *    - Update local database immediately
 *    - Mark as 'pending'
 *    - Sync in background
 *    - Show sync status in UI (syncing icon)
 *    - Handle failures gracefully (retry queue)
 *
 * 7. Background Sync:
 *    - Use expo-task-manager for background tasks
 *    - Periodic sync every 15 minutes (when app active)
 *    - Immediate sync on user action (save session)
 *    - Network-aware (only sync on WiFi option)
 *
 * 8. Security:
 *    - User authentication required (Firebase Auth / Supabase Auth)
 *    - Server-side validation of session data
 *    - Row-level security (users can only access their sessions)
 *    - Encryption in transit (HTTPS)
 *    - Optional: Encryption at rest for sensitive notes
 *
 * 9. Error Handling:
 *    - Network errors: Queue for retry with exponential backoff
 *    - Auth errors: Prompt re-authentication
 *    - Conflict errors: Present resolution UI
 *    - Quota errors: Warn user about storage limits
 *
 * 10. Migration from Phase 1 to Phase 2:
 *     - On first sign-in, prompt to upload local sessions
 *     - Batch upload all 'local-only' sessions
 *     - Update sync_status to 'synced'
 *     - Keep local data as fallback (offline mode)
 *
 * Example Implementation (Phase 2):
 *
 * ```typescript
 * // Firebase implementation
 * import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
 * import { getAuth } from 'firebase/auth';
 *
 * class FirebaseSyncService implements ISyncService {
 *   private db = getFirestore();
 *   private auth = getAuth();
 *
 *   async syncSession(sessionId: string): Promise<SyncResult> {
 *     const userId = this.auth.currentUser?.uid;
 *     if (!userId) {
 *       return { success: false, error: 'Not authenticated' };
 *     }
 *
 *     try {
 *       // Get local session
 *       const localSession = await sessionService.getSession(sessionId);
 *       if (!localSession) {
 *         return { success: false, error: 'Session not found' };
 *       }
 *
 *       // Upload to Firestore
 *       const sessionRef = doc(this.db, 'sessions', userId, 'sessions', sessionId);
 *       await setDoc(sessionRef, {
 *         ...localSession,
 *         sync_status: 'synced',
 *         synced_at: new Date().toISOString(),
 *       });
 *
 *       // Update local sync status
 *       await sessionService.updateSession({
 *         ...localSession,
 *         syncStatus: 'synced',
 *       });
 *
 *       return { success: true, syncedCount: 1, failedCount: 0, conflicts: [] };
 *     } catch (error) {
 *       console.error('Sync error:', error);
 *       return { success: false, syncedCount: 0, failedCount: 1, conflicts: [], error: String(error) };
 *     }
 *   }
 * }
 * ```
 */
