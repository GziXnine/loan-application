import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import RadioGroup from '../common/RadioGroup';
import CurrencyInput from '../common/CurrencyInput';
import Select from '../common/Select';
import Input from '../common/Input';

const Step1LoanType = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(1));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(1, getValues());
      }
      return isValid;
    },
  }));

  const loanTypeOptions = [
    { value: 'personal', label: 'Personal Loan', icon: '👤', description: 'For personal expenses' },
    { value: 'home', label: 'Home Loan', icon: '🏠', description: 'For buying a house' },
    { value: 'business', label: 'Business Loan', icon: '💼', description: 'For business expansion' },
  ];

  const tenureOptions = [
    { value: '12', label: '12 Months (1 Year)' },
    { value: '24', label: '24 Months (2 Years)' },
    { value: '36', label: '36 Months (3 Years)' },
    { value: '48', label: '48 Months (4 Years)' },
    { value: '60', label: '60 Months (5 Years)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          What type of loan do you need?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Select the loan type that best fits your requirements.
        </p>
      </div>

      <Controller
        name="loanType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Loan Type"
            options={loanTypeOptions}
            layout="cards"
            required
            error={errors.loanType?.message}
            {...field}
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Controller
          name="loanAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Loan Amount"
              placeholder="e.g. 5,00,000"
              required
              min={10000}
              max={50000000}
              error={errors.loanAmount?.message}
              {...field}
            />
          )}
        />

        <Select
          label="Loan Tenure"
          options={tenureOptions}
          required
          error={errors.loanTenure?.message}
          {...register('loanTenure')}
        />
      </div>

      <div className="pt-2">
        <Input
          label="Purpose of Loan"
          placeholder="e.g. Home Renovation, Medical Emergency"
          required
          error={errors.loanPurpose?.message}
          {...register('loanPurpose')}
        />
      </div>
    </div>
  );
});

export default Step1LoanType;
