import clsx from 'clsx';
import useLoanStore from '../../store/loanStore';

/**
 * StepNavigation Component
 *
 * Bottom navigation bar with Previous/Next/Save Draft buttons.
 * - Previous: Goes to the prior step (hidden on step 1)
 * - Save Draft: Triggers auto-save manually
 * - Next / Submit: Advances to next step or submits on final step
 */
export default function StepNavigation({
  onNext, onPrev, onSaveDraft, isLastStep,
}) {
  const currentStep = useLoanStore((state) => state.currentStep);
  const isSubmitting = useLoanStore((state) => state.isSubmitting);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-surface-200">
      {/* Left Side: Previous + Save Draft */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="btn-secondary group"
            id="btn-prev-step"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        )}

        <button
          type="button"
          onClick={onSaveDraft}
          className="btn-ghost text-gray-500"
          id="btn-save-draft"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Draft
        </button>
      </div>

      {/* Right Side: Next / Submit */}
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={clsx(
          'w-full sm:w-auto group',
          isLastStep ? 'btn-accent btn-lg' : 'btn-primary',
        )}
        id={isLastStep ? 'btn-submit-application' : 'btn-next-step'}
      >
        {(() => {
          if (isSubmitting) {
            return (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            );
          }
          if (isLastStep) {
            return (
              <>
                Submit Application
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            );
          }
          return (
            <>
              Next Step
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          );
        })()}
      </button>
    </div>
  );
}
