import { lazy, Suspense, useCallback, useMemo, useRef, useEffect } from 'react';
import useLoanStore, { STEP_CONFIG, TOTAL_STEPS } from '../../store/loanStore';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';

// ============================================================
// Lazy-loaded Step Components for performance
// ============================================================
const Step1LoanType = lazy(() => import('../steps/Step1LoanType'));
const Step2PersonalInfo = lazy(() => import('../steps/Step2PersonalInfo'));
const Step3KYCVerification = lazy(() => import('../steps/Step3KYCVerification'));
const Step4AddressDetails = lazy(() => import('../steps/Step4AddressDetails'));
const Step5Employment = lazy(() => import('../steps/Step5Employment'));
const Step6CoApplicant = lazy(() => import('../steps/Step6CoApplicant'));
const Step7Documents = lazy(() => import('../steps/Step7Documents'));
const Step8ReviewSubmit = lazy(() => import('../steps/Step8ReviewSubmit'));

const STEP_COMPONENTS = {
  1: Step1LoanType,
  2: Step2PersonalInfo,
  3: Step3KYCVerification,
  4: Step4AddressDetails,
  5: Step5Employment,
  6: Step6CoApplicant,
  7: Step7Documents,
  8: Step8ReviewSubmit,
};

/**
 * Loading Skeleton for lazy-loaded steps
 */
function StepLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-surface-200 rounded-lg w-1/3" />
      <div className="h-4 bg-surface-200 rounded w-2/3" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-surface-200 rounded w-1/4" />
            <div className="h-12 bg-surface-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Wizard Component
 * 
 * The main orchestrator for the multi-step loan application.
 * Manages step rendering, validation gating, navigation,
 * and focus management for accessibility.
 */
export default function Wizard() {
  const currentStep = useLoanStore((state) => state.currentStep);
  const goToNextStep = useLoanStore((state) => state.goToNextStep);
  const goToPrevStep = useLoanStore((state) => state.goToPrevStep);
  const markStepCompleted = useLoanStore((state) => state.markStepCompleted);
  const getVisibleSteps = useLoanStore((state) => state.getVisibleSteps);
  const isStepVisible = useLoanStore((state) => state.isStepVisible);
  const setSubmitting = useLoanStore((state) => state.setSubmitting);
  const setSubmitted = useLoanStore((state) => state.setSubmitted);

  const stepContainerRef = useRef(null);
  const stepFormRef = useRef(null);

  const visibleSteps = useMemo(() => getVisibleSteps(), [getVisibleSteps]);
  const isLastStep = useMemo(() => {
    const lastVisible = visibleSteps[visibleSteps.length - 1];
    return currentStep === lastVisible?.id;
  }, [currentStep, visibleSteps]);

  // Focus management: move focus to step container on step change
  useEffect(() => {
    if (stepContainerRef.current) {
      // Small delay to allow the lazy component to render
      const timer = setTimeout(() => {
        const firstInput = stepContainerRef.current.querySelector(
          'input:not([type="hidden"]), select, textarea, [tabindex="0"]'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Handle browser back button via popstate
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      const stepMatch = hash.match(/#step-(\d+)/);
      if (stepMatch) {
        const step = parseInt(stepMatch[1], 10);
        if (step >= 1 && step <= TOTAL_STEPS && isStepVisible(step)) {
          // Only update if it's different to avoid re-renders
          if (useLoanStore.getState().currentStep !== step) {
            useLoanStore.getState().goToStep(step);
          }
        }
      } else {
        // No hash, go to step 1
        useLoanStore.getState().goToStep(1);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isStepVisible]);

  // Sync hash when currentStep changes
  useEffect(() => {
    const currentHash = window.location.hash;
    const targetHash = `#step-${currentStep}`;
    if (currentHash !== targetHash) {
      if (!currentHash) {
        window.history.replaceState(null, '', targetHash);
      } else {
        window.history.pushState(null, '', targetHash);
      }
    }
  }, [currentStep]);

  // Handle Next / Submit
  const handleNext = useCallback(async () => {
    // Trigger form validation via the ref
    if (stepFormRef.current?.validate) {
      const isValid = await stepFormRef.current.validate();
      if (!isValid) return;
    }

    if (isLastStep) {
      // Final submission
      setSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSubmitted(true);
      } catch (error) {
        console.error('Submission failed:', error);
      } finally {
        setSubmitting(false);
      }
    } else {
      markStepCompleted(currentStep);

      // Find next visible step
      let nextStep = currentStep + 1;
      while (nextStep <= TOTAL_STEPS && !isStepVisible(nextStep)) {
        nextStep++;
      }
      if (nextStep <= TOTAL_STEPS) {
        useLoanStore.getState().goToStep(nextStep);
      }
    }
  }, [currentStep, isLastStep, markStepCompleted, setSubmitting, setSubmitted, isStepVisible]);

  // Handle Previous
  const handlePrev = useCallback(() => {
    let prevStep = currentStep - 1;
    while (prevStep >= 1 && !isStepVisible(prevStep)) {
      prevStep--;
    }
    if (prevStep >= 1) {
      useLoanStore.getState().goToStep(prevStep);
    }
  }, [currentStep, isStepVisible]);

  // Handle Save Draft
  const handleSaveDraft = useCallback(() => {
    import('../../hooks/useAutoSave').then(({ triggerManualSave }) => {
      triggerManualSave();
    });
  }, []);

  // Get the current step component
  const StepComponent = STEP_COMPONENTS[currentStep];
  const currentStepConfig = STEP_CONFIG[currentStep - 1];

  if (!StepComponent) {
    return (
      <div className="card p-8 text-center text-gray-500">
        <p>Step {currentStep} is not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <ProgressBar />

      {/* Step Content Card */}
      <div className="card-elevated overflow-hidden">
        {/* Step Header */}
        <div className="bg-gradient-to-r from-primary-500/5 to-accent-500/5 px-6 sm:px-8 py-5 border-b border-surface-200/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">
              {currentStepConfig.icon}
            </span>
            <div>
              <h2 className="text-lg font-heading font-bold text-gray-900">
                {currentStepConfig.title}
              </h2>
              <p className="text-sm text-gray-500">
                {currentStepConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div
          ref={stepContainerRef}
          className="px-6 sm:px-8 py-6 step-container"
          role="region"
          aria-label={`Step ${currentStep}: ${currentStepConfig.title}`}
        >
          <Suspense fallback={<StepLoadingSkeleton />}>
            <StepComponent ref={stepFormRef} />
          </Suspense>
        </div>

        {/* Step Navigation */}
        <div className="px-6 sm:px-8 pb-6">
          <StepNavigation
            onNext={handleNext}
            onPrev={handlePrev}
            onSaveDraft={handleSaveDraft}
            isLastStep={isLastStep}
          />
        </div>
      </div>
    </div>
  );
}
