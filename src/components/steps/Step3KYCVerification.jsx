import { forwardRef, useImperativeHandle, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import MaskedInput from '../common/MaskedInput';
import clsx from 'clsx';

const Step3KYCVerification = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(3));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);

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
    mode: 'onChange',
  });

  const isPanVerified = watch('isPanVerified');
  const isAadhaarVerified = watch('isAadhaarVerified');
  const panValue = watch('panNumber');
  const aadhaarValue = watch('aadhaarNumber');

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

  const handleVerifyPan = async () => {
    // Validate just the pan number first
    const isPanValid = await trigger('panNumber');
    if (!isPanValid) return;

    setVerifyingPan(true);
    // Simulate API call
    setTimeout(() => {
      setValue('isPanVerified', true, { shouldValidate: true });
      setVerifyingPan(false);
    }, 1500);
  };

  const handleVerifyAadhaar = async () => {
    // Validate just the aadhaar number first
    const isAadhaarValid = await trigger('aadhaarNumber');
    if (!isAadhaarValid) return;

    setVerifyingAadhaar(true);
    // Simulate API call
    setTimeout(() => {
      setValue('isAadhaarVerified', true, { shouldValidate: true });
      setVerifyingAadhaar(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          KYC Verification
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          We need to verify your identity to proceed with the application. Your data is encrypted and secure.
        </p>
      </div>

      <div className="card bg-surface-50 p-6 border-surface-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
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
                  disabled={isPanVerified || verifyingPan}
                  error={errors.panNumber?.message}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // If they change it after verifying, reset verify status
                    if (isPanVerified) setValue('isPanVerified', false);
                  }}
                />
              )}
            />
          </div>
          
          <button
            type="button"
            onClick={handleVerifyPan}
            disabled={isPanVerified || verifyingPan || !panValue || panValue.length < 10}
            className={clsx(
              'btn min-w-[120px] mb-[22px]', // mb-[22px] aligns with input baseline compensating for error text margin
              {
                'btn-success bg-accent-50 text-accent-700 border border-accent-200 cursor-default': isPanVerified,
                'btn-primary': !isPanVerified && !verifyingPan,
                'btn-secondary opacity-70': verifyingPan || !panValue || panValue.length < 10,
              }
            )}
          >
            {verifyingPan ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : isPanVerified ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            ) : (
              'Verify PAN'
            )}
          </button>
        </div>
        {errors.isPanVerified && !errors.panNumber && (
          <p className="text-xs text-error-500 mt-2" role="alert">{errors.isPanVerified.message}</p>
        )}
      </div>

      <div className="card bg-surface-50 p-6 border-surface-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
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
                  disabled={isAadhaarVerified || verifyingAadhaar}
                  error={errors.aadhaarNumber?.message}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // If they change it after verifying, reset verify status
                    if (isAadhaarVerified) setValue('isAadhaarVerified', false);
                  }}
                />
              )}
            />
          </div>
          
          <button
            type="button"
            onClick={handleVerifyAadhaar}
            disabled={isAadhaarVerified || verifyingAadhaar || !aadhaarValue || aadhaarValue.length < 12}
            className={clsx(
              'btn min-w-[120px] mb-[22px]',
              {
                'btn-success bg-accent-50 text-accent-700 border border-accent-200 cursor-default': isAadhaarVerified,
                'btn-primary': !isAadhaarVerified && !verifyingAadhaar,
                'btn-secondary opacity-70': verifyingAadhaar || !aadhaarValue || aadhaarValue.length < 12,
              }
            )}
          >
            {verifyingAadhaar ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : isAadhaarVerified ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            ) : (
              'Verify Aadhaar'
            )}
          </button>
        </div>
        {errors.isAadhaarVerified && !errors.aadhaarNumber && (
          <p className="text-xs text-error-500 mt-2" role="alert">{errors.isAadhaarVerified.message}</p>
        )}
      </div>

    </div>
  );
});

export default Step3KYCVerification;
