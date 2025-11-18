/**
 * Zustand Store
 *
 * Central application state management with persistence.
 * Combines multiple slices: session, flavor wheel, and UI state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSessionSlice, type SessionSlice } from './sessionSlice';
import { createFlavorWheelSlice, type FlavorWheelSlice } from './flavorWheelSlice';
import { createUISlice, type UISlice } from './uiSlice';

/**
 * Combined store type
 */
export type AppStore = SessionSlice & FlavorWheelSlice & UISlice;

/**
 * Create the main application store with persistence
 */
export const useStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSessionSlice(...args),
      ...createFlavorWheelSlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: 'cupper-app-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist certain fields
      partialize: (state) => ({
        // Persist sessions list but not loading/error states
        sessions: state.sessions,

        // Persist flavor wheel viewport settings
        viewportTransform: state.viewportTransform,

        // Don't persist UI state (toasts, modals, loading)
        // Don't persist currentSession (load fresh on app start)
      }),

      // Version for migration support
      version: 1,

      // Migration function for future schema changes
      migrate: (persistedState: any, version: number) => {
        console.log('[Store] Migrating from version', version);

        if (version === 0) {
          // Future: Add migration logic here
          // Example: rename fields, transform data, etc.
        }

        return persistedState as AppStore;
      },

      // Merge strategy for rehydration
      merge: (persistedState, currentState) => {
        console.log('[Store] Rehydrating state...');
        return {
          ...currentState,
          ...(persistedState as Partial<AppStore>),
          // Override specific fields if needed
          isLoading: false, // Always start with loading: false
          error: null, // Clear errors on rehydration
        } as AppStore;
      },

      // Called after rehydration completes
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[Store] Rehydration error:', error);
          } else {
            console.log('[Store] Rehydration complete');
            console.log('[Store] Loaded', state?.sessions?.length || 0, 'sessions');
          }
        };
      },
    }
  )
);

/**
 * Hook to get session actions
 */
export const useSessionActions = () =>
  useStore(state => ({
    createSession: state.createSession,
    loadSession: state.loadSession,
    updateCurrentSession: state.updateCurrentSession,
    deleteSession: state.deleteSession,
    duplicateSession: state.duplicateSession,
    loadAllSessions: state.loadAllSessions,
    setCurrentSession: state.setCurrentSession,
    clearError: state.clearError,
  }));

/**
 * Hook to get session state
 */
export const useSessionState = () =>
  useStore(state => ({
    sessions: state.sessions,
    currentSession: state.currentSession,
    isLoading: state.isLoading,
    error: state.error,
  }));

/**
 * Hook to get flavor wheel actions
 */
export const useFlavorWheelActions = () =>
  useStore(state => ({
    setViewportTransform: state.setViewportTransform,
    setCenteredFlavor: state.setCenteredFlavor,
    setIsAnimating: state.setIsAnimating,
    setSearchQuery: state.setSearchQuery,
    setCategoryFilter: state.setCategoryFilter,
    resetViewport: state.resetViewport,
    clearFilters: state.clearFilters,
  }));

/**
 * Hook to get flavor wheel state
 */
export const useFlavorWheelState = () =>
  useStore(state => ({
    viewportTransform: state.viewportTransform,
    centeredFlavorId: state.centeredFlavorId,
    isAnimating: state.isAnimating,
    searchQuery: state.searchQuery,
    categoryFilter: state.categoryFilter,
  }));

/**
 * Hook to get UI actions
 */
export const useUIActions = () =>
  useStore(state => ({
    showToast: state.showToast,
    hideToast: state.hideToast,
    clearToasts: state.clearToasts,
    openModal: state.openModal,
    closeModal: state.closeModal,
    setGlobalLoading: state.setGlobalLoading,
  }));

/**
 * Hook to get UI state
 */
export const useUIState = () =>
  useStore(state => ({
    toasts: state.toasts,
    modal: state.modal,
    isGlobalLoading: state.isGlobalLoading,
  }));
