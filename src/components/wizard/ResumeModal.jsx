import { useEffect, useState } from 'react';
import useLoanStore from '../../store/loanStore';
import { loadSavedState, clearSavedState } from '../../hooks/useAutoSave';

export default function ResumeModal() {
  const showResumeModal = useLoanStore((state) => state.showResumeModal);
  const setShowResumeModal = useLoanStore((state) => state.setShowResumeModal);
  const [isRestoring, setIsRestoring] = useState(false);
  const [saveTime, setSaveTime] = useState('');

  // Fetch the timestamp just to display to the user
  useEffect(() => {
    if (showResumeModal) {
      try {
        const savedData = localStorage.getItem('lendswift_application_state');
        if (savedData) {
          const { timestamp } = JSON.parse(savedData);
          setSaveTime(new Date(timestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }));
        }
      } catch (e) {
        // Ignore parsing errors here
      }
    }
  }, [showResumeModal]);

  if (!showResumeModal) return null;

  const handleResume = async () => {
    setIsRestoring(true);
    try {
      const restoredState = await loadSavedState();
      if (restoredState) {
        useLoanStore.setState({
          formData: restoredState.formData,
          currentStep: restoredState.currentStep,
          completedSteps: restoredState.completedSteps,
          visitedSteps: restoredState.visitedSteps,
          showResumeModal: false,
          isDirty: false,
        });
      } else {
        // Decryption failed or state corrupt
        setShowResumeModal(false);
        clearSavedState();
      }
    } catch (err) {
      console.error(err);
      setShowResumeModal(false);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleStartFresh = () => {
    clearSavedState();
    setShowResumeModal(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-elevated w-full max-w-md overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          
          <h2 id="modal-title" className="text-xl font-heading font-bold text-gray-900 mb-2">
            Resume Application?
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            We found an incomplete loan application saved on <span className="font-semibold text-gray-800">{saveTime}</span>. 
            Would you like to pick up where you left off, or start a new application?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleStartFresh}
              disabled={isRestoring}
              className="btn-secondary flex-1"
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={handleResume}
              disabled={isRestoring}
              className="btn-primary flex-1"
            >
              {isRestoring ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Decrypting...
                </>
              ) : (
                'Resume Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
