/** @format */

import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema } from "../../utils/validationSchemas";
import useLoanStore from "../../store/loanStore";
import MaskedInput from "../common/MaskedInput";
import Checkbox from "../common/Checkbox";
import useVerification from "../../hooks/useVerification";

const Step3KYCVerification = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(3));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    control,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: stepData,
    mode: "onChange",
  });

  const isPanVerified = watch("isPanVerified");
  const isAadhaarVerified = watch("isAadhaarVerified");
  const panValue = watch("panNumber");
  const aadhaarValue = watch("aadhaarNumber");

  const panVerification = useVerification(panValue, "pan");
  const aadhaarVerification = useVerification(aadhaarValue, "aadhaar");

  useImperativeHandle(ref, () => ({
    validate: async () => {
      // Force trigger validation to show all errors
      const isValid = await trigger();
      if (isValid) {
        updateStepData(3, getValues());
      }
      return isValid;
    },
  }));

  useEffect(() => {
    setValue("isPanVerified", panVerification.isVerified, {
      shouldValidate: true,
    });
  }, [panVerification.isVerified, setValue]);

  useEffect(() => {
    setValue("isAadhaarVerified", aadhaarVerification.isVerified, {
      shouldValidate: true,
    });
  }, [aadhaarVerification.isVerified, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          KYC Verification
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          We need to verify your identity to proceed with the application. Your
          data is encrypted and secure.
        </p>
      </div>

      <div className="card bg-surface-50 p-6 border-surface-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <Controller
              name="panNumber"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  label="PAN Number"
                  placeholder="e.g. ABCDE1234F"
                  maskType="pan"
                  required
                  disabled={panVerification.isVerifying}
                  error={errors.panNumber?.message || panVerification.error}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // If they change it after verifying, reset verify status
                    if (isPanVerified) setValue("isPanVerified", false);
                  }}
                  onBlur={() => {
                    trigger("panNumber");
                    panVerification.triggerVerification();
                  }}
                />
              )}
            />
          </div>
          <div className="min-w-[140px] mb-[18px]">
            {panVerification.isVerifying ? (
              <span className="inline-flex items-center gap-2 text-sm text-primary-600">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Verifying...
              </span>
            ) : isPanVerified ? (
              <span className="inline-flex items-center gap-2 text-sm text-accent-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Verified
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Verification pending
              </span>
            )}
          </div>
        </div>
        {errors.isPanVerified && !errors.panNumber && (
          <p className="text-xs text-error-500 mt-2" role="alert">
            {errors.isPanVerified.message}
          </p>
        )}
      </div>

      <div className="card bg-surface-50 p-6 border-surface-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <Controller
              name="aadhaarNumber"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  label="Aadhaar Number"
                  placeholder="12-digit Aadhaar number"
                  maskType="aadhaar"
                  required
                  disabled={aadhaarVerification.isVerifying}
                  error={
                    errors.aadhaarNumber?.message || aadhaarVerification.error
                  }
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // If they change it after verifying, reset verify status
                    if (isAadhaarVerified) setValue("isAadhaarVerified", false);
                  }}
                  onBlur={() => {
                    trigger("aadhaarNumber");
                    aadhaarVerification.triggerVerification();
                  }}
                />
              )}
            />
          </div>
          <div className="min-w-[140px] mb-[18px]">
            {aadhaarVerification.isVerifying ? (
              <span className="inline-flex items-center gap-2 text-sm text-primary-600">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Verifying...
              </span>
            ) : isAadhaarVerified ? (
              <span className="inline-flex items-center gap-2 text-sm text-accent-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Verified
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Verification pending
              </span>
            )}
          </div>
        </div>
        {errors.isAadhaarVerified && !errors.aadhaarNumber && (
          <p className="text-xs text-error-500 mt-2" role="alert">
            {errors.isAadhaarVerified.message}
          </p>
        )}

        <div className="mt-4">
          <Controller
            name="aadhaarConsent"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="I authorize LendSwift to verify my Aadhaar details for KYC"
                description="As per UIDAI and RBI guidelines, your Aadhaar will only be used for verification purposes."
                required
                error={errors.aadhaarConsent?.message}
                {...field}
                checked={field.value}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
});

export default Step3KYCVerification;
