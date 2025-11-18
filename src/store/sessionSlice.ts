/**
 * Session Store Slice
 *
 * Manages tasting session state with Zustand.
 * Integrates with SessionService for persistence.
 */

import type { StateCreator } from 'zustand';
import type { Session, SessionType, SessionFilters } from '../types/session.types';
import { sessionService } from '../services/sessionService';

/**
 * Session slice state
 */
export interface SessionSlice {
  // State
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createSession: (type: SessionType) => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  updateCurrentSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  duplicateSession: (id: string) => Promise<void>;
  loadAllSessions: (filters?: SessionFilters) => Promise<void>;
  setCurrentSession: (session: Session | null) => void;
  clearError: () => void;
}

/**
 * Create session slice
 */
export const createSessionSlice: StateCreator<SessionSlice> = (set, _get) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  // Create new session
  createSession: async (type: SessionType) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sessionService.createSession(type);
      set(state => ({
        sessions: [session, ...state.sessions],
        currentSession: session,
        isLoading: false,
      }));
      console.log('[SessionSlice] Created session:', session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Create session error:', error);
    }
  },

  // Load session by ID
  loadSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sessionService.getSession(id);
      if (session) {
        set({ currentSession: session, isLoading: false });
        console.log('[SessionSlice] Loaded session:', id);
      } else {
        set({ error: 'Session not found', isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Load session error:', error);
    }
  },

  // Update current session
  updateCurrentSession: async (session: Session) => {
    set({ isLoading: true, error: null });
    try {
      await sessionService.updateSession(session);
      set(state => ({
        currentSession: session,
        sessions: state.sessions.map(s => (s.id === session.id ? session : s)),
        isLoading: false,
      }));
      console.log('[SessionSlice] Updated session:', session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Update session error:', error);
    }
  },

  // Delete session
  deleteSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sessionService.deleteSession(id);
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== id),
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
        isLoading: false,
      }));
      console.log('[SessionSlice] Deleted session:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Delete session error:', error);
    }
  },

  // Duplicate session
  duplicateSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const duplicated = await sessionService.duplicateSession(id);
      set(state => ({
        sessions: [duplicated, ...state.sessions],
        currentSession: duplicated,
        isLoading: false,
      }));
      console.log('[SessionSlice] Duplicated session:', id, '→', duplicated.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate session';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Duplicate session error:', error);
    }
  },

  // Load all sessions with optional filters
  loadAllSessions: async (filters?: SessionFilters) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await sessionService.getAllSessions(filters);
      set({ sessions, isLoading: false });
      console.log('[SessionSlice] Loaded', sessions.length, 'sessions');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
      set({ error: errorMessage, isLoading: false });
      console.error('[SessionSlice] Load sessions error:', error);
    }
  },

  // Set current session (without persisting)
  setCurrentSession: (session: Session | null) => {
    set({ currentSession: session });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
});
