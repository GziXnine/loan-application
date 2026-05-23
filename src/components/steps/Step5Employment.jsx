import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step5Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import RadioGroup from '../common/RadioGroup';
import Input from '../common/Input';
import CurrencyInput from '../common/CurrencyInput';

const Step5Employment = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(5));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step5Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const employmentType = watch('employmentType');

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(5, getValues());
      }
      return isValid;
    },
  }));

  const employmentOptions = [
    { value: 'salaried', label: 'Salaried', icon: '👔', description: 'Employed by a company' },
    { value: 'self_employed', label: 'Self-Employed', icon: '💼', description: 'Business owner or freelancer' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Employment Information
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Tell us about your current employment and income.
        </p>
      </div>

      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Employment Type"
            options={employmentOptions}
            layout="cards"
            required
            error={errors.employmentType?.message}
            {...field}
          />
        )}
      />

      {employmentType === 'salaried' && (
        <div className="space-y-6 animate-fade-in pt-4">
          <Input
            label="Company Name"
            placeholder="e.g. Tata Consultancy Services"
            required
            error={errors.companyName?.message}
            {...register('companyName')}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Designation"
              placeholder="e.g. Software Engineer"
              required
              error={errors.designation?.message}
              {...register('designation')}
            />
            
            <Input
              label="Work Experience (Years)"
              type="number"
              placeholder="e.g. 5"
              required
              min={0}
              error={errors.workExperience?.message}
              {...register('workExperience')}
            />
          </div>

          <Controller
            name="monthlyIncome"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Net Monthly Income"
                placeholder="e.g. 50,000"
                required
                error={errors.monthlyIncome?.message}
                {...field}
              />
            )}
          />
        </div>
      )}

      {employmentType === 'self_employed' && (
        <div className="space-y-6 animate-fade-in pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Business Name"
              placeholder="e.g. Sharma Traders"
              required
              error={errors.businessName?.message}
              {...register('businessName')}
            />
            
            <Input
              label="Business Type"
              placeholder="e.g. Retail, Manufacturing, Services"
              required
              error={errors.businessType?.message}
              {...register('businessType')}
            />
          </div>

          <Input
            label="Business Vintage (Years)"
            type="number"
            placeholder="e.g. 3"
            required
            min={0}
            error={errors.businessVintage?.message}
            {...register('businessVintage')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Annual Turnover"
                  placeholder="e.g. 50,00,000"
                  required
                  error={errors.annualTurnover?.message}
                  {...field}
                />
              )}
            />
            
            <Controller
              name="monthlyProfit"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Net Monthly Profit (Optional)"
                  placeholder="e.g. 1,00,000"
                  error={errors.monthlyProfit?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Registration Number (Optional)"
              placeholder="e.g. U74999MH..."
              error={errors.companyRegistrationNumber?.message}
              {...register('companyRegistrationNumber')}
            />
            
            <Input
              label="GST Number (Optional)"
              placeholder="15-digit GSTIN"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default Step5Employment;
