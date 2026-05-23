import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';

const Step2PersonalInfo = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(2));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(2, getValues());
      }
      return isValid;
    },
  }));

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Tell us about yourself
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Please provide your personal details exactly as they appear on your PAN/Aadhaar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          placeholder="As per PAN card"
          required
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Date of Birth"
          type="date"
          required
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
        />
      </div>

      <div className="pt-2">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Gender"
              options={genderOptions}
              layout="horizontal"
              required
              error={errors.gender?.message}
              {...field}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Marital Status"
          options={maritalStatusOptions}
          required
          error={errors.maritalStatus?.message}
          {...register('maritalStatus')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Input
          label="Mobile Number"
          type="tel"
          placeholder="10-digit mobile number"
          required
          leftIcon={<span className="text-sm">+91</span>}
          inputClassName="pl-12"
          error={errors.mobileNumber?.message}
          {...register('mobileNumber')}
        />

        <Input
          label="Alternate Mobile (Optional)"
          type="tel"
          placeholder="10-digit mobile number"
          leftIcon={<span className="text-sm">+91</span>}
          inputClassName="pl-12"
          error={errors.alternateMobile?.message}
          {...register('alternateMobile')}
        />
      </div>
    </div>
  );
});

export default Step2PersonalInfo;
