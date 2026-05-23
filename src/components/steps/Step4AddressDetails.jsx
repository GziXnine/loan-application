import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: stepData,
    mode: 'onChange',
  });

  const residenceType = watch('residenceType');
  const pincode = watch('pincode');
  const isRented = residenceType === 'rented';
  
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Address Autocomplete based on Pincode
  useEffect(() => {
    if (pincode && pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode)) {
      const fetchPincodeDetails = async () => {
        setIsFetchingPincode(true);
        try {
          // Using the free Indian Postal Pincode API
          const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await response.json();
          
          if (data && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            // Update the form fields automatically
            setValue('city', postOffice.District || postOffice.Block, { shouldValidate: true });
            setValue('state', postOffice.State, { shouldValidate: true });
          }
        } catch (error) {
          console.error("Failed to fetch pincode details:", error);
        } finally {
          setIsFetchingPincode(false);
        }
      };
      
      fetchPincodeDetails();
    }
  }, [pincode, setValue]);

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
          <Input.Field placeholder="e.g. Mumbai" {...register('city')} disabled={isFetchingPincode} />
          <Input.Error />
        </Input>

        <Input error={errors.state?.message}>
          <Input.Label required>State</Input.Label>
          <Input.Field placeholder="e.g. Maharashtra" {...register('state')} disabled={isFetchingPincode} />
          <Input.Error />
        </Input>

        <Input error={errors.pincode?.message}>
          <Input.Label required>Pincode {isFetchingPincode && <span className="text-2xs text-primary-500 font-normal ml-2 animate-pulse">(Finding city...)</span>}</Input.Label>
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
