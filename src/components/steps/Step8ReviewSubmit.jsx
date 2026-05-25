/** @format */

import { forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step8Schema } from "../../utils/validationSchemas";
import useLoanStore from "../../store/loanStore";
import Checkbox from "../common/Checkbox";

const Step8ReviewSubmit = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(8));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  const formData = useLoanStore((state) => state.formData);

  const {
    control,
    trigger,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step8Schema),
    defaultValues: stepData,
    mode: "onChange",
  });

  function checkEmiAffordability() {
    const loanAmount = Number(formData.step1.loanAmount) || 0;
    const tenureMonths = Number(formData.step1.loanTenure) || 0;
    const employmentType = formData.step5.employmentType;

    let monthlyIncome = 0;
    if (employmentType === "salaried") {
      monthlyIncome = Number(formData.step5.monthlyIncome) || 0;
    } else {
      monthlyIncome = Number(formData.step5.monthlyProfit) || 0;
      if (!monthlyIncome) {
        monthlyIncome = (Number(formData.step5.annualTurnover) || 0) / 12;
      }
    }

    if (!loanAmount || !tenureMonths || !monthlyIncome) {
      return { isAffordable: true, message: "" };
    }

    // Assumed baseline interest rate for affordability checks.
    const annualRate = 0.12;
    const monthlyRate = annualRate / 12;
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    if (emi > monthlyIncome * 0.5) {
      return {
        isAffordable: false,
        message:
          "EMI exceeds 50% of your monthly income. Please reduce loan amount or tenure.",
      };
    }

    return { isAffordable: true, message: "" };
  }

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      const emiCheck = checkEmiAffordability();
      if (!emiCheck.isAffordable) {
        setError("root", { type: "manual", message: emiCheck.message });
      } else {
        clearErrors("root");
      }
      if (isValid && emiCheck.isAffordable) {
        updateStepData(8, getValues());
      }
      return isValid && emiCheck.isAffordable;
    },
  }));

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

      {/* Application Summary Card */}
      <div className="bg-surface-50 border border-surface-200 rounded-xl p-6">
        <h4 className="font-heading font-semibold text-primary-800 mb-4 pb-2 border-b border-surface-200">
          Application Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-0.5">Applicant Name</span>
            <span className="font-medium text-gray-900">
              {formData.step2.fullName || "Not provided"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Loan Type</span>
            <span className="font-medium text-gray-900 capitalize">
              {formData.step1.loanType || "Not selected"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Requested Amount</span>
            <span className="font-medium text-gray-900">
              {formData.step1.loanAmount
                ? `₹${Number(formData.step1.loanAmount).toLocaleString("en-IN")}`
                : "Not provided"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Tenure</span>
            <span className="font-medium text-gray-900">
              {formData.step1.loanTenure
                ? `${formData.step1.loanTenure} Months`
                : "Not provided"}
            </span>
          </div>
        </div>
      </div>

      {/* Consents & Agreements */}
      <div className="space-y-4">
        <h4 className="font-heading font-semibold text-gray-900">
          Declarations & Consent
        </h4>
        {errors.root?.message && (
          <div className="border border-error-200 bg-error-50 text-error-700 rounded-xl p-3 text-sm">
            {errors.root.message}
          </div>
        )}

        <Controller
          name="kfsAccepted"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="I have read and understood the Key Fact Statement (KFS)"
              description="The KFS contains important details regarding interest rates, fees, and charges as per RBI Digital Lending Guidelines."
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
