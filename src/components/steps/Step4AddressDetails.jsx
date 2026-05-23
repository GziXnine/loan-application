import { forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';

const Step4AddressDetails = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(4));
  const updateStepData = useLoanStore((state) => state.updateStepData);

  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const residenceType = watch('residenceType');
  const isRented = residenceType === 'rented';

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger();
      if (isValid) {
        updateStepData(4, getValues());
      }
      return isValid;
    },
  }));

  const residenceOptions = [
    { value: 'owned', label: 'Owned by self/spouse' },
    { value: 'rented', label: 'Rented' },
    { value: 'company_provided', label: 'Company Provided' },
    { value: 'family_owned', label: 'Owned by Parents/Siblings' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
          Where do you currently live?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Provide your current residential address for physical verification if required.
        </p>
      </div>

      <Select
        label="Residence Type"
        options={residenceOptions}
        required
        error={errors.residenceType?.message}
        {...register('residenceType')}
      />

      <Input
        label="Current Address Line 1"
        placeholder="House/Flat No., Building Name, Street"
        required
        error={errors.currentAddress?.message}
        {...register('currentAddress')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="City"
          placeholder="e.g. Mumbai"
          required
          error={errors.city?.message}
          {...register('city')}
        />

        <Input
          label="State"
          placeholder="e.g. Maharashtra"
          required
          error={errors.state?.message}
          {...register('state')}
        />

        <Input
          label="Pincode"
          placeholder="e.g. 400001"
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          error={errors.pincode?.message}
          {...register('pincode')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Years at Current Address"
          type="number"
          placeholder="e.g. 5"
          required
          min={0}
          error={errors.yearsAtCurrentAddress?.message}
          {...register('yearsAtCurrentAddress')}
        />

        {isRented && (
          <Controller
            name="rentAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Monthly Rent Amount"
                placeholder="e.g. 15,000"
                required
                error={errors.rentAmount?.message}
                {...field}
              />
            )}
          />
        )}
      </div>
    </div>
  );
});

export default Step4AddressDetails;
