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
    console.log('Manual save complete');
  } catch (err) {
    console.error('Manual save failed:', err);
  }
}

/**
 * Custom hook to handle auto-saving the wizard state to LocalStorage.
 * Includes encryption, interval saving, and manual save triggers.
 */
export default function useAutoSave() {
  const {
    formData,
    currentStep,
    completedSteps,
    visitedSteps,
    isDirty,
    autoSaveEnabled,
    setLastSavedAt,
    setShowResumeModal,
  } = useLoanStore();

  const isInitialMount = useRef(true);

  // 1. Check for existing saved state on mount
  useEffect(() => {
    const checkSavedState = async () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        const parsedData = JSON.parse(savedData);
        
        // Check TTL
        const savedTime = new Date(parsedData.timestamp).getTime();
        const now = new Date().getTime();
        const hoursElapsed = (now - savedTime) / (1000 * 60 * 60);

        if (hoursElapsed > TTL_HOURS) {
          console.log('Saved state expired TTL. Purging.');
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // We have a valid, unexpired save. We don't decrypt until the user
        // chooses to resume, so we just trigger the modal here.
        setShowResumeModal(true);
      } catch (err) {
        console.error('Failed to parse saved state metadata', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    checkSavedState();
  }, [setShowResumeModal]);

  // 2. The core save function (now uses the exported function)
  const triggerSave = useCallback(() => {
    if (isDirty) {
      triggerManualSave();
    }
  }, [isDirty]);

  // 3. Set up the 30-second interval auto-save (only if dirty)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isDirty || !autoSaveEnabled) return;

    const intervalId = setInterval(() => {
      triggerSave();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isDirty, autoSaveEnabled, triggerSave]);

  // 4. Also save on beforeunload (when user closes tab)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
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
    console.error('Failed to load/decrypt saved state', err);
    return null;
  }
}

/**
 * Utility to clear the saved state (used on final submit or discard)
 */
export function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}
