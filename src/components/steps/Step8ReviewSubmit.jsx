/** @format */

import { forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step8Schema } from "../../utils/validationSchemas";
import useLoanStore from "../../store/loanStore";
import Checkbox from "../common/Checkbox";
import { buildPreApprovalSummary, formatINR } from "../../utils/emiCalculator";

const Step8ReviewSubmit = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(8));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  const formData = useLoanStore((state) => state.formData);
  const goToStep = useLoanStore((state) => state.goToStep);

  const {
    control,
    trigger,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step8Schema),
    defaultValues: stepData,
    mode: "onChange",
  });

  const loanAmount = Number(formData.step1.loanAmount) || 0;
  const tenureMonths = Number(formData.step1.loanTenure) || 0;
  const loanType = formData.step1.loanType || "personal";

  let monthlyIncome = 0;
  if (formData.step5.employmentType === "salaried") {
    monthlyIncome = Number(formData.step5.monthlyIncome) || 0;
  } else {
    monthlyIncome = Number(formData.step5.monthlyProfit) || 0;
    if (!monthlyIncome) {
      monthlyIncome = (Number(formData.step5.annualTurnover) || 0) / 12;
    }
  }

  const coapplicantIncome = formData.step6.hasCoapplicant ? (Number(formData.step6.coapplicantIncome) || 0) : 0;

  const summary = buildPreApprovalSummary({
    principal: loanAmount,
    tenureMonths,
    loanType,
    monthlyIncome,
    coapplicantIncome,
  });

  const showHighEmiWarning = summary.exceedsEmiThreshold;

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      let customValid = true;

      if (showHighEmiWarning && !getValues().highEmiConsent) {
        customValid = false;
        setError("highEmiConsent", {
          type: "manual",
          message: "You must acknowledge the high EMI warning to proceed.",
        });
      } else {
        clearErrors("highEmiConsent");
      }

      if (isValid && customValid) {
        updateStepData(8, getValues());
      }
      return isValid && customValid;
    },
  }));

  const SectionHeader = ({ title, stepIndex }) => (
    <div className="flex justify-between items-center mb-3 pb-2 border-b border-surface-200">
      <h4 className="font-heading font-semibold text-gray-800">{title}</h4>
      <button
        type="button"
        onClick={() => goToStep(stepIndex)}
        className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
      >
        Edit
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Review & Submit
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please review your loan summary and provide your digital signature to
          submit the application.
        </p>
      </div>

      {/* Pre-Approval Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-surface-100 border border-primary-200 rounded-xl p-6 shadow-sm">
        <h4 className="font-heading font-semibold text-primary-800 mb-4 pb-2 border-b border-primary-200">
          Pre-Approval Summary
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div className="bg-white p-3 rounded-lg border border-surface-200">
            <span className="text-gray-500 block text-xs mb-1">Loan Amount</span>
            <span className="font-bold text-gray-900 text-lg">
              {formatINR(loanAmount)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-surface-200">
            <span className="text-gray-500 block text-xs mb-1">EMI</span>
            <span className="font-bold text-gray-900 text-lg">
              {formatINR(summary.emi)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-surface-200">
            <span className="text-gray-500 block text-xs mb-1">Interest Rate</span>
            <span className="font-bold text-gray-900 text-lg">
              {(summary.annualRate * 100).toFixed(2)}%
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-surface-200">
            <span className="text-gray-500 block text-xs mb-1">Tenure</span>
            <span className="font-bold text-gray-900 text-lg">
              {tenureMonths} mo
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-surface-200">
          <div className="flex justify-between border-b border-surface-100 pb-2">
            <span className="text-gray-600">Total Repayment Amount</span>
            <span className="font-medium">{formatINR(summary.totalRepayment)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-100 pb-2">
            <span className="text-gray-600">Total Interest Payable</span>
            <span className="font-medium">{formatINR(summary.totalInterest)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-100 pb-2 sm:border-none sm:pb-0">
            <span className="text-gray-600">Processing Fee</span>
            <span className="font-medium">{formatINR(summary.processingFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Net Disbursal Amount</span>
            <span className="font-medium text-success-600">{formatINR(summary.netDisbursal)}</span>
          </div>
        </div>
      </div>

      {showHighEmiWarning && (
        <div className="border border-warning-200 bg-warning-50 text-warning-800 rounded-xl p-4 text-sm flex gap-3 items-start">
          <svg className="w-5 h-5 text-warning-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold mb-1">High EMI Alert</p>
            <p>Your calculated EMI ({formatINR(summary.emi)}) exceeds 50% of your total monthly income ({formatINR(summary.totalMonthlyIncome)}). This may impact your loan approval. Please provide your consent below if you wish to proceed.</p>
          </div>
        </div>
      )}

      {/* Section-by-Section Summary */}
      <div className="space-y-6">
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <SectionHeader title="1. Personal Information" stepIndex={2} />
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs block">Full Name</span>
              <span className="font-medium">{formData.step2.fullName || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Mobile Number</span>
              <span className="font-medium">{formData.step2.mobileNumber || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Email Address</span>
              <span className="font-medium truncate block">{formData.step2.email || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">PAN Number</span>
              <span className="font-medium uppercase">{formData.step3.panNumber || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <SectionHeader title="2. Employment & Income" stepIndex={5} />
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs block">Employment Type</span>
              <span className="font-medium capitalize">{formData.step5.employmentType?.replace('_', ' ') || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Calculated Monthly Income</span>
              <span className="font-medium">{formatINR(monthlyIncome)}</span>
            </div>
            {formData.step6.hasCoapplicant && (
              <>
                <div>
                  <span className="text-gray-500 text-xs block">Co-Applicant Name</span>
                  <span className="font-medium">{formData.step6.coapplicantName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Co-Applicant Income</span>
                  <span className="font-medium">{formatINR(coapplicantIncome)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <SectionHeader title="3. Address Details" stepIndex={4} />
          <div className="text-sm">
             <span className="text-gray-500 text-xs block">Current Address</span>
             <span className="font-medium block">{formData.step4.currentAddress || "N/A"}</span>
             <span className="font-medium block">{formData.step4.city}, {formData.step4.state} - {formData.step4.pincode}</span>
          </div>
        </div>
      </div>

      {/* E-Signature Display */}
      {formData.step7.signature && (
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <h4 className="font-heading font-semibold text-gray-800 mb-3">E-Signature</h4>
          <div className="border border-surface-300 bg-white rounded-lg p-4 inline-block">
            <span className="font-signature text-2xl text-gray-800 tracking-wider" style={{ fontFamily: "'Dancing Script', cursive" }}>
              {formData.step7.signature}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Digitally signed by {formData.step2.fullName} on {new Date().toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Consents & Agreements */}
      <div className="space-y-4 pt-2">
        <h4 className="font-heading font-semibold text-gray-900 border-b border-surface-200 pb-2">
          Declarations & Consent
        </h4>

        {showHighEmiWarning && (
          <Controller
            name="highEmiConsent"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="I acknowledge that my calculated EMI is high relative to my income and wish to proceed."
                required
                error={errors.highEmiConsent?.message}
                {...field}
                checked={field.value}
              />
            )}
          />
        )}

        <Controller
          name="declarationAccepted"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="I declare that all information provided is true and correct."
              required
              error={errors.declarationAccepted?.message}
              {...field}
              checked={field.value}
            />
          )}
        />

        <Controller
          name="kfsAccepted"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="I have read and understood the Key Fact Statement (KFS)"
              description="The KFS contains important details regarding interest rates, fees, and charges."
              required
              error={errors.kfsAccepted?.message}
              {...field}
              checked={field.value}
            />
          )}
        />

        <Controller
          name="consentToDataProcessing"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="I consent to the processing of my personal data"
              description="I authorize LendSwift to fetch my credit report and verify my KYC details."
              required
              error={errors.consentToDataProcessing?.message}
              {...field}
              checked={field.value}
            />
          )}
        />

        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="I accept the Terms and Conditions"
              required
              error={errors.termsAccepted?.message}
              {...field}
              checked={field.value}
            />
          )}
        />
      </div>
    </div>
  );
});

export default Step8ReviewSubmit;
