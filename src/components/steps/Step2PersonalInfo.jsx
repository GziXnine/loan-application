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
        <Input error={errors.fullName?.message}>
          <Input.Label required>Full Name</Input.Label>
          <Input.Field placeholder="As per PAN card" {...register('fullName')} />
          <Input.Error />
        </Input>

        <Input error={errors.dateOfBirth?.message}>
          <Input.Label required>Date of Birth</Input.Label>
          <Input.Field type="date" {...register('dateOfBirth')} />
          <Input.Error />
        </Input>
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
        <Input error={errors.email?.message}>
          <Input.Label required>Email Address</Input.Label>
          <Input.Field type="email" placeholder="your.email@example.com" {...register('email')} />
          <Input.Error />
        </Input>

        <Select
          label="Marital Status"
          options={maritalStatusOptions}
          required
          variant="custom"
          error={errors.maritalStatus?.message}
          {...register('maritalStatus')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Input error={errors.mobileNumber?.message}>
          <Input.Label required>Mobile Number</Input.Label>
          <Input.Field
            type="tel"
            placeholder="10-digit mobile number"
            leftIcon={<span className="text-sm">+91</span>}
            {...register('mobileNumber')}
          />
          <Input.Error />
        </Input>

        <Input error={errors.alternateMobile?.message}>
          <Input.Label>Alternate Mobile (Optional)</Input.Label>
          <Input.Field
            type="tel"
            placeholder="10-digit mobile number"
            leftIcon={<span className="text-sm">+91</span>}
            {...register('alternateMobile')}
          />
          <Input.Error />
        </Input>
      </div>
    </div>
  );
});

export default Step2PersonalInfo;
