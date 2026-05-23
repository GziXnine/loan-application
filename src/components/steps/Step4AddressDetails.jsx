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

      <Input error={errors.currentAddress?.message}>
        <Input.Label required>Current Address Line 1</Input.Label>
        <Input.Field placeholder="House/Flat No., Building Name, Street" {...register('currentAddress')} />
        <Input.Error />
      </Input>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input error={errors.city?.message}>
          <Input.Label required>City</Input.Label>
          <Input.Field placeholder="e.g. Mumbai" {...register('city')} />
          <Input.Error />
        </Input>

        <Input error={errors.state?.message}>
          <Input.Label required>State</Input.Label>
          <Input.Field placeholder="e.g. Maharashtra" {...register('state')} />
          <Input.Error />
        </Input>

        <Input error={errors.pincode?.message}>
          <Input.Label required>Pincode</Input.Label>
          <Input.Field
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 400001"
            {...register('pincode')}
          />
          <Input.Error />
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input error={errors.yearsAtCurrentAddress?.message}>
          <Input.Label required>Years at Current Address</Input.Label>
          <Input.Field type="number" min={0} placeholder="e.g. 5" {...register('yearsAtCurrentAddress')} />
          <Input.Error />
        </Input>

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
