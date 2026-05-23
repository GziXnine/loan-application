import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import RadioGroup from '../common/RadioGroup';

const Step6CoApplicant = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(6));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step6Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const hasCoapplicant = watch('hasCoapplicant');

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
        </div>
      )}
    </div>
  );
});

export default Step6CoApplicant;
