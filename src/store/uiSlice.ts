/**
 * UI Store Slice
 *
 * Manages global UI state (modals, toasts, loading states).
 */

import type { StateCreator } from 'zustand';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // milliseconds
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  modalType: string | null;
  modalProps?: Record<string, unknown>;
}

/**
 * UI slice state
 */
export interface UISlice {
  // Toast notifications
  toasts: Toast[];

  // Modal state
  modal: ModalState;

  // Global loading
  isGlobalLoading: boolean;

  // Actions
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (modalType: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  setGlobalLoading: (isLoading: boolean) => void;
}

/**
 * Generate unique toast ID
 */
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create UI slice
 */
export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Initial state
  toasts: [],
  modal: {
    isOpen: false,
    modalType: null,
    modalProps: undefined,
  },
  isGlobalLoading: false,

  // Show toast notification
  showToast: (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = generateToastId();
    const toast: Toast = { id, message, type, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }

    console.log('[UISlice] Toast shown:', message, type);
  },

  // Hide specific toast
  hideToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  // Clear all toasts
  clearToasts: () => {
    set({ toasts: [] });
  },

  // Open modal
  openModal: (modalType: string, props?: Record<string, unknown>) => {
    set({
      modal: {
        isOpen: true,
        modalType,
        modalProps: props,
      },
    });
    console.log('[UISlice] Modal opened:', modalType);
  },

  // Close modal
  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        modalType: null,
        modalProps: undefined,
      },
    });
  },

  // Set global loading state
  setGlobalLoading: (isLoading: boolean) => {
    set({ isGlobalLoading: isLoading });
  },
});
