import { useMemo } from 'react';
import useLoanStore from '../../store/loanStore';
import clsx from 'clsx';

/**
 * ProgressBar Component
 * 
 * Displays the multi-step progress indicator with:
 * - Step numbers/icons with completion states
 * - Connecting lines with gradient fill
 * - Current step highlight with pulse animation
 * - Overall percentage completion
 * - Accessible aria-labels for screen readers
 */
export default function ProgressBar() {
  const currentStep = useLoanStore((state) => state.currentStep);
  const completedSteps = useLoanStore((state) => state.completedSteps);
  const goToStep = useLoanStore((state) => state.goToStep);
  const getVisibleSteps = useLoanStore((state) => state.getVisibleSteps);
  const getProgress = useLoanStore((state) => state.getProgress);

  const visibleSteps = useMemo(() => getVisibleSteps(), [getVisibleSteps]);
  const progress = useMemo(() => getProgress(), [getProgress]);

  return (
    <div className="mb-8">
      {/* Progress Percentage Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Application Progress</span>
          <span className="text-sm font-semibold text-primary-500">{progress}%</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Application ${progress}% complete`}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <nav aria-label="Application steps" className="relative">
        {/* Desktop: Horizontal Steps */}
        <ol className="hidden md:flex items-center justify-between">
          {visibleSteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = isCompleted || isCurrent || (index === 0) ||
              completedSteps.has(visibleSteps[index - 1]?.id);

            return (
              <li key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Connecting Line */}
                  {index > 0 && (
                    <div className="absolute top-5 -left-1/2 w-full h-0.5">
                      <div className={clsx(
                        'h-full transition-all duration-500',
                        isCompleted || isCurrent
                          ? 'bg-gradient-to-r from-accent-500 to-primary-500'
                          : 'bg-surface-200'
                      )} />
                    </div>
                  )}

                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => isAccessible && goToStep(step.id)}
                    disabled={!isAccessible}
                    className={clsx(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                      'text-sm font-semibold transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      {
                        // Completed
                        'bg-accent-500 text-white shadow-glow-accent': isCompleted && !isCurrent,
                        // Current
                        'bg-primary-500 text-white shadow-glow-primary ring-4 ring-primary-100': isCurrent,
                        // Accessible but not current/completed
                        'bg-white text-gray-500 border-2 border-surface-300 hover:border-primary-300 cursor-pointer': isAccessible && !isCurrent && !isCompleted,
                        // Disabled
                        'bg-surface-100 text-gray-400 border-2 border-surface-200 cursor-not-allowed': !isAccessible,
                      }
                    )}
                    aria-label={`Step ${step.id}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p className={clsx(
                      'text-xs font-medium transition-colors duration-300',
                      {
                        'text-accent-600': isCompleted && !isCurrent,
                        'text-primary-600 font-semibold': isCurrent,
                        'text-gray-500': !isCurrent && !isCompleted,
                      }
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Mobile: Compact Step Display */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-surface-100 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm shadow-glow-primary">
                {currentStep}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {visibleSteps.find(s => s.id === currentStep)?.title}
                </p>
                <p className="text-2xs text-gray-500">
                  Step {visibleSteps.findIndex(s => s.id === currentStep) + 1} of {visibleSteps.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary-500">{progress}%</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
