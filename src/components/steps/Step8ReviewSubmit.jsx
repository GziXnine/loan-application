import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step8Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Checkbox from '../common/Checkbox';
import SignatureCanvas from '../common/SignatureCanvas';

const Step8ReviewSubmit = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(8));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  const formData = useLoanStore((state) => state.formData);

  const signatureRef = useRef(null);

  const {
    control,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step8Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      // Get latest signature directly from canvas ref
      if (signatureRef.current) {
        const sigData = signatureRef.current.getSignature();
        setValue('signature', sigData || '', { shouldValidate: true });
      }

      const isValid = await trigger();
      if (isValid) {
        updateStepData(8, getValues());
      }
      return isValid;
    },
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Review & Submit
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please review your loan summary and provide your digital signature to submit the application.
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
            <span className="font-medium text-gray-900">{formData.step2.fullName || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Loan Type</span>
            <span className="font-medium text-gray-900 capitalize">{formData.step1.loanType || 'Not selected'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Requested Amount</span>
            <span className="font-medium text-gray-900">
              {formData.step1.loanAmount ? `₹${Number(formData.step1.loanAmount).toLocaleString('en-IN')}` : 'Not provided'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Tenure</span>
            <span className="font-medium text-gray-900">
              {formData.step1.loanTenure ? `${formData.step1.loanTenure} Months` : 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Consents & Agreements */}
      <div className="space-y-4">
        <h4 className="font-heading font-semibold text-gray-900">Declarations & Consent</h4>
        
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

      {/* E-Signature */}
      <div className="pt-4 border-t border-surface-200">
        <h4 className="font-heading font-semibold text-gray-900 mb-4">Digital Signature</h4>
        <Controller
          name="signature"
          control={control}
          render={({ field }) => (
            <SignatureCanvas
              ref={signatureRef}
              label="Please sign in the box below"
              required
              error={errors.signature?.message}
              onEnd={(data) => field.onChange(data)}
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-2">
          By signing, I confirm that all the information provided is accurate and true to the best of my knowledge.
        </p>
      </div>

    </div>
  );
});

export default Step8ReviewSubmit;
