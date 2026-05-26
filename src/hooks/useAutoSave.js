import { useEffect, useRef, useCallback } from 'react';
import useLoanStore from '../store/loanStore';
import { encryptData, decryptData } from '../utils/crypto';

export const STORAGE_KEY = 'lendswift_application_state';
export const TTL_HOURS = 72; // 72 hours TTL as per requirements

/**
 * Triggers a manual save to LocalStorage (with encryption)
 */
export async function triggerManualSave() {
  const store = useLoanStore.getState();
  if (!store.autoSaveEnabled) return;

  try {
    const stateToSave = {
      formData: store.formData,
      currentStep: store.currentStep,
      completedSteps: Array.from(store.completedSteps),
      visitedSteps: Array.from(store.visitedSteps),
    };

    const encryptedPayload = await encryptData(stateToSave);

    const storageObject = {
      timestamp: new Date().toISOString(),
      payload: encryptedPayload,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageObject));
    store.setLastSavedAt(storageObject.timestamp);
  } catch (err) {
    // ignore
  }
}

/**
 * Custom hook to handle auto-saving the wizard state to LocalStorage.
 * Includes encryption, interval saving, and manual save triggers.
 */
export default function useAutoSave() {
  const {
    isDirty,
    autoSaveEnabled,
  } = useLoanStore();

  const isInitialMount = useRef(true);

  // 1. The core save function (now uses the exported function)
  const triggerSave = useCallback(() => {
    if (isDirty) {
      triggerManualSave();
    }
  }, [isDirty]);

  // 2. Set up the 30-second interval auto-save (only if dirty)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return undefined;
    }

    if (!isDirty || !autoSaveEnabled) return undefined;

    const intervalId = setInterval(() => {
      triggerSave();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isDirty, autoSaveEnabled, triggerSave]);

  // 3. Also save on beforeunload (when user closes tab)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && autoSaveEnabled) {
        // Can't reliably await async crypto in beforeunload,
        // so we just rely on the 30s interval for the most part.
        // Modern browsers often block async work here.
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, autoSaveEnabled]);

  return {
    triggerSave, // Exported for manual "Save Draft" button
  };
}

/**
 * Utility function to actually load the state from storage and decrypt it
 */
export async function loadSavedState() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return null;

  try {
    const { payload } = JSON.parse(savedData);
    const decryptedState = await decryptData(payload);

    // Convert arrays back to Sets
    return {
      ...decryptedState,
      completedSteps: new Set(decryptedState.completedSteps),
      visitedSteps: new Set(decryptedState.visitedSteps),
    };
  } catch (err) {
    return null;
  }
}

/**
 * Utility to clear the saved state (used on final submit or discard)
 */
export function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}
