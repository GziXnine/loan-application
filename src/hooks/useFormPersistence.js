import { useEffect } from 'react';
import useLoanStore from '../store/loanStore';
import { STORAGE_KEY, TTL_HOURS } from './useAutoSave';

export default function useFormPersistence() {
  const setShowResumeModal = useLoanStore((state) => state.setShowResumeModal);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return;

      const parsedData = JSON.parse(savedData);
      const savedTime = new Date(parsedData.timestamp).getTime();
      const now = new Date().getTime();
      const hoursElapsed = (now - savedTime) / (1000 * 60 * 60);

      if (hoursElapsed > TTL_HOURS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      setShowResumeModal(true);
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setShowResumeModal]);
}
