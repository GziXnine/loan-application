import { lazy, Suspense } from 'react';
import Wizard from './components/wizard/Wizard';
import useLoanStore from './store/loanStore';

/**
 * LendSwift Loan Application
 * 
 * Main application shell that renders the Wizard component
 * inside the LendSwift branded layout.
 */
function App() {
  const isSubmitted = useLoanStore((state) => state.isSubmitted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-surface-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-primary">
                <span className="text-white font-heading font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold text-primary-500">
                  LendSwift
                </h1>
                <p className="text-2xs text-gray-500 -mt-0.5">Loan Application Portal</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-4">
              <AutoSaveIndicator />
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-soft" />
                Secure Connection
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSubmitted ? <SuccessScreen /> : <Wizard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2024 LendSwift Financial Services. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button className="hover:text-primary-500 transition-colors" type="button">Privacy Policy</button>
              <button className="hover:text-primary-500 transition-colors" type="button">Terms of Service</button>
              <button className="hover:text-primary-500 transition-colors" type="button">Help & Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Auto-save status indicator in the header
 */
function AutoSaveIndicator() {
  const lastSavedAt = useLoanStore((state) => state.lastSavedAt);
  const isDirty = useLoanStore((state) => state.isDirty);

  if (!lastSavedAt && !isDirty) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {isDirty ? (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse-soft" />
          <span className="text-warning-600">Unsaved changes</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-accent-600">Saved</span>
        </>
      )}
    </div>
  );
}

/**
 * Success screen shown after submission
 */
function SuccessScreen() {
  const resetForm = useLoanStore((state) => state.resetForm);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card-elevated p-8 sm:p-12 max-w-lg mx-auto text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
          Application Submitted! 🎉
        </h2>
        <p className="text-gray-600 mb-2">
          Your loan application has been successfully submitted. You will receive a confirmation email shortly.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Application Reference: <span className="font-mono font-semibold text-primary-500">LS-{Date.now().toString(36).toUpperCase()}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={resetForm}
            className="btn-secondary"
          >
            Start New Application
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
