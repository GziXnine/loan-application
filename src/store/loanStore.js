/**
 * LendSwift Loan Application - Global State Store
 * 
 * Uses Zustand for lightweight, performant state management.
 * Manages the multi-step wizard state, form data across all 8 steps,
 * and cross-step validation dependencies.
 */
import { create } from 'zustand';

// ============================================================
// Constants
// ============================================================
export const LOAN_TYPE_PERSONAL = 'personal';
export const LOAN_TYPE_HOME = 'home';
export const LOAN_TYPE_BUSINESS = 'business';

export const TOTAL_STEPS = 8;

export const STEP_CONFIG = [
  { id: 1, title: 'Loan Type', description: 'Select your loan type and amount', icon: '🏦' },
  { id: 2, title: 'Personal Info', description: 'Your personal details', icon: '👤' },
  { id: 3, title: 'KYC Verification', description: 'Identity verification', icon: '🔐' },
  { id: 4, title: 'Address Details', description: 'Your residence information', icon: '🏠' },
  { id: 5, title: 'Employment', description: 'Employment and income', icon: '💼' },
  { id: 6, title: 'Co-Applicant', description: 'Co-applicant details', icon: '👥' },
  { id: 7, title: 'Documents', description: 'Upload required documents', icon: '📄' },
  { id: 8, title: 'Review & Submit', description: 'Review and submit', icon: '✅' },
];

// ============================================================
// Initial Form Data
// ============================================================
const initialFormData = {
  // Step 1: Loan Type
  step1: {
    loanType: '',
    loanAmount: '',
    loanTenure: '',
    loanPurpose: '',
  },
  // Step 2: Personal Info
  step2: {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    mobileNumber: '',
    alternateMobile: '',
    maritalStatus: '',
  },
  // Step 3: KYC Verification
  step3: {
    panNumber: '',
    isPanVerified: false,
    aadhaarNumber: '',
    isAadhaarVerified: false,
  },
  // Step 4: Address Details
  step4: {
    residenceType: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    yearsAtCurrentAddress: '',
    rentAmount: '',
  },
  // Step 5: Employment
  step5: {
    employmentType: '',
    // Salaried fields
    companyName: '',
    designation: '',
    workExperience: '',
    monthlyIncome: '',
    // Self-employed fields
    businessName: '',
    businessType: '',
    businessVintage: '',
    annualTurnover: '',
    monthlyProfit: '',
    // Business Owner fields
    companyRegistrationNumber: '',
    gstNumber: '',
  },
  // Step 6: Co-Applicant
  step6: {
    hasCoapplicant: false,
    coapplicantName: '',
    coapplicantRelationship: '',
    coapplicantIncome: '',
    coapplicantEmail: '',
    coapplicantMobile: '',
  },
  // Step 7: Documents
  step7: {
    identityProof: [],
    addressProof: [],
    incomeProof: [],
    additionalDocs: [],
  },
  // Step 8: Review & Submit
  step8: {
    termsAccepted: false,
    kfsAccepted: false,
    consentToDataProcessing: false,
    signature: null,
  },
};

// ============================================================
// Store
// ============================================================
const useLoanStore = create((set, get) => ({
  // ---- Wizard State ----
  currentStep: 1,
  completedSteps: new Set(),
  visitedSteps: new Set([1]),
  isSubmitting: false,
  isSubmitted: false,

  // ---- Form Data ----
  formData: { ...initialFormData },

  // ---- Auto-save State ----
  lastSavedAt: null,
  isDirty: false,
  autoSaveEnabled: true,

  // ---- UI State ----
  showResumeModal: false,

  // ---- Actions: Navigation ----
  goToStep: (step) => {
    const { completedSteps, visitedSteps } = get();
    // Can only navigate to completed steps or the next incomplete step
    const maxAllowedStep = Math.max(...completedSteps, 0) + 1;
    if (step >= 1 && step <= TOTAL_STEPS && step <= Math.max(maxAllowedStep, 1)) {
      set((state) => ({
        currentStep: step,
        visitedSteps: new Set([...state.visitedSteps, step]),
      }));
    }
  },

  goToNextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS) {
      get().goToStep(currentStep + 1);
    }
  },

  goToPrevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  markStepCompleted: (step) => {
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    }));
  },

  markStepIncomplete: (step) => {
    set((state) => {
      const newCompleted = new Set(state.completedSteps);
      newCompleted.delete(step);
      return { completedSteps: newCompleted };
    });
  },

  // ---- Actions: Form Data ----
  updateStepData: (step, data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [`step${step}`]: {
          ...state.formData[`step${step}`],
          ...data,
        },
      },
      isDirty: true,
    }));
  },

  getStepData: (step) => {
    return get().formData[`step${step}`];
  },

  // ---- Actions: Auto-save ----
  setLastSavedAt: (timestamp) => {
    set({ lastSavedAt: timestamp, isDirty: false });
  },

  setAutoSaveEnabled: (enabled) => {
    set({ autoSaveEnabled: enabled });
  },

  // ---- Actions: Submission ----
  setSubmitting: (value) => {
    set({ isSubmitting: value });
  },

  setSubmitted: (value) => {
    set({ isSubmitted: value });
  },

  // ---- Actions: Resume Modal ----
  setShowResumeModal: (show) => {
    set({ showResumeModal: show });
  },

  // ---- Actions: Reset ----
  resetForm: () => {
    set({
      currentStep: 1,
      completedSteps: new Set(),
      visitedSteps: new Set([1]),
      formData: { ...initialFormData },
      isSubmitting: false,
      isSubmitted: false,
      lastSavedAt: null,
      isDirty: false,
    });
  },

  // ---- Computed: Step Visibility ----
  isStepVisible: (step) => {
    const { formData } = get();
    const loanType = formData.step1.loanType;
    const loanAmount = parseFloat(formData.step1.loanAmount) || 0;

    // Step 6 (Co-Applicant) is only visible for:
    // - Home Loan always
    // - Personal Loan > 5L
    // - Business Loan > 20L
    if (step === 6) {
      if (loanType === LOAN_TYPE_HOME) return true;
      if (loanType === LOAN_TYPE_PERSONAL && loanAmount > 500000) return true;
      if (loanType === LOAN_TYPE_BUSINESS && loanAmount > 2000000) return true;
      return false;
    }

    return true;
  },

  // ---- Computed: Progress ----
  getProgress: () => {
    const { completedSteps } = get();
    const visibleSteps = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (get().isStepVisible(i)) {
        visibleSteps.push(i);
      }
    }
    const completedVisible = visibleSteps.filter((s) => completedSteps.has(s));
    return Math.round((completedVisible.length / visibleSteps.length) * 100);
  },

  // ---- Computed: Visible Steps ----
  getVisibleSteps: () => {
    const steps = [];
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (get().isStepVisible(i)) {
        steps.push(STEP_CONFIG[i - 1]);
      }
    }
    return steps;
  },
}));

export default useLoanStore;
