import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import RadioGroup from '../common/RadioGroup';
import MaskedInput from '../common/MaskedInput';
import Checkbox from '../common/Checkbox';
import SignatureCanvas from '../common/SignatureCanvas';
import useVerification from '../../hooks/useVerification';

const Step6CoApplicant = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(6));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step6Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const hasCoapplicant = watch('hasCoapplicant');
  const coapplicantPan = watch('coapplicantPan');

  const panVerification = useVerification(coapplicantPan, 'pan');

  useEffect(() => {
    setValue('isCoapplicantPanVerified', panVerification.isVerified, { shouldValidate: true });
  }, [panVerification.isVerified, setValue]);

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(6, getValues());
      }
      return isValid;
    },
  }));

  const coapplicantOptions = [
    { value: false, label: 'No, I am applying individually' },
    { value: true, label: 'Yes, add a co-applicant' },
  ];

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'other', label: 'Other Relative' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Co-Applicant Details
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Adding a co-applicant with a steady income can increase your loan eligibility.
        </p>
      </div>

      <Controller
        name="hasCoapplicant"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Would you like to add a co-applicant?"
            options={coapplicantOptions}
            layout="vertical"
            error={errors.hasCoapplicant?.message}
            {...field}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value === 'true')}
          />
        )}
      />

      {hasCoapplicant && (
        <div className="space-y-6 animate-fade-in pt-4 border-t border-surface-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input error={errors.coapplicantName?.message}>
              <Input.Label required>Co-Applicant Full Name</Input.Label>
              <Input.Field placeholder="As per PAN" {...register('coapplicantName')} />
              <Input.Error />
            </Input>

            <Select
              label="Relationship with Applicant"
              options={relationshipOptions}
              required
              variant="custom"
              error={errors.coapplicantRelationship?.message}
              {...register('coapplicantRelationship')}
            />
          </div>

          <Controller
            name="coapplicantIncome"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Net Monthly Income"
                placeholder="e.g. 40,000"
                required
                error={errors.coapplicantIncome?.message}
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input error={errors.coapplicantEmail?.message}>
              <Input.Label required>Email Address</Input.Label>
              <Input.Field type="email" placeholder="co-applicant@example.com" {...register('coapplicantEmail')} />
              <Input.Error />
            </Input>

            <Input error={errors.coapplicantMobile?.message}>
              <Input.Label required>Mobile Number</Input.Label>
              <Input.Field
                type="tel"
                placeholder="10-digit mobile number"
                leftIcon={<span className="text-sm">+91</span>}
                {...register('coapplicantMobile')}
              />
              <Input.Error />
            </Input>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 w-full">
              <Controller
                name="coapplicantPan"
                control={control}
                render={({ field }) => (
                  <MaskedInput
                    label="Co-Applicant PAN"
                    placeholder="e.g. ABCDE1234F"
                    maskType="pan"
                    required
                    disabled={panVerification.isVerifying}
                    error={errors.coapplicantPan?.message || panVerification.error}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (panVerification.isVerified) setValue('isCoapplicantPanVerified', false);
                    }}
                    onBlur={() => {
                      trigger('coapplicantPan');
                      panVerification.triggerVerification();
                    }}
                  />
                )}
              />
            </div>
            <div className="min-w-[140px] mb-[18px]">
              {panVerification.isVerifying ? (
                <span className="inline-flex items-center gap-2 text-sm text-primary-600">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : panVerification.isVerified ? (
                <span className="inline-flex items-center gap-2 text-sm text-accent-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="text-xs text-gray-400">Verification pending</span>
              )}
            </div>
          </div>
          {errors.isCoapplicantPanVerified && !errors.coapplicantPan && (
            <p className="text-xs text-error-500 mt-2" role="alert">
              {errors.isCoapplicantPanVerified.message}
            </p>
          )}

          <Controller
            name="coapplicantConsent"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Co-applicant consents to data sharing and verification"
                description="By consenting, the co-applicant authorizes LendSwift to verify their PAN and income information."
                required
                error={errors.coapplicantConsent?.message}
                {...field}
                checked={field.value}
              />
            )}
          />

          <Controller
            name="coapplicantSignature"
            control={control}
            render={({ field }) => (
              <SignatureCanvas
                label="Co-applicant Signature"
                required
                error={errors.coapplicantSignature?.message}
                onEnd={(data) => field.onChange(data)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
});

export default Step6CoApplicant;
