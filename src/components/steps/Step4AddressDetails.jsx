import { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema } from '../../utils/validationSchemas';
import useLoanStore from '../../store/loanStore';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import Checkbox from '../common/Checkbox';
import usePinCodeLookup from '../../hooks/usePinCodeLookup';

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
  const stateValue = watch('state');
  const currentAddress = watch('currentAddress');
  const cityValue = watch('city');
  const sameAsPermanent = watch('sameAsPermanent');
  const yearsAtCurrentAddress = watch('yearsAtCurrentAddress');
  const isRented = residenceType === 'rented';
  const [stateEdited, setStateEdited] = useState(false);

  const { city, state, postOffice, isLoading, error: pincodeError } = usePinCodeLookup(pincode);

  useEffect(() => {
    if (city) {
      setValue('city', city, { shouldValidate: true });
    }
    if (state && !stateEdited) {
      setValue('state', state, { shouldValidate: true });
    }
  }, [city, state, setValue, stateEdited]);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setStateEdited(false);
    }
  }, [pincode]);

  useEffect(() => {
    if (sameAsPermanent) {
      setValue('permanentAddress', currentAddress, { shouldValidate: true });
      setValue('permanentCity', cityValue, { shouldValidate: true });
      setValue('permanentState', stateValue, { shouldValidate: true });
      setValue('permanentPincode', pincode, { shouldValidate: true });
    }
  }, [sameAsPermanent, currentAddress, cityValue, stateValue, pincode, setValue]);

  const showPreviousAddress = useMemo(
    () => {
      if (yearsAtCurrentAddress === '' || yearsAtCurrentAddress === null || yearsAtCurrentAddress === undefined) {
        return false;
      }
      const value = Number(yearsAtCurrentAddress);
      return !Number.isNaN(value) && value < 1;
    },
    [yearsAtCurrentAddress]
  );

  const showStateMismatchWarning = useMemo(
    () => stateEdited && state && stateValue && stateValue.toLowerCase() !== state.toLowerCase(),
    [stateValue, state, stateEdited]
  );

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
        variant="custom"
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
          <Input.Field
            placeholder="e.g. Maharashtra"
            {...register('state', {
              onChange: (event) => {
                setStateEdited(true);
                return event;
              },
            })}
          />
          <Input.Error />
          {showStateMismatchWarning && (
            <p className="text-xs text-warning-600 mt-1">Pincode suggests {state}. Please confirm.</p>
          )}
        </Input>

        <Input error={errors.pincode?.message || pincodeError}>
          <Input.Label required>
            Pincode {isLoading && <span className="text-2xs text-primary-500 font-normal ml-2 animate-pulse">(Looking up...)</span>}
          </Input.Label>
          <Input.Field
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 400001"
            {...register('pincode')}
          />
          <Input.Error />
          {postOffice && !errors.pincode && !pincodeError && (
            <p className="text-xs text-gray-500 mt-1">Post Office: {postOffice}</p>
          )}
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

      <div className="pt-2">
        <Controller
          name="sameAsPermanent"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Permanent address is same as current address"
              description="We will copy your current address into your permanent address details."
              {...field}
              checked={field.value}
            />
          )}
        />
      </div>

      {!sameAsPermanent && (
        <div className="space-y-6 pt-2 border-t border-surface-200">
          <h4 className="text-sm font-semibold text-gray-800">Permanent Address</h4>
          <Input error={errors.permanentAddress?.message}>
            <Input.Label required>Permanent Address Line 1</Input.Label>
            <Input.Field placeholder="House/Flat No., Building Name, Street" {...register('permanentAddress')} />
            <Input.Error />
          </Input>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input error={errors.permanentCity?.message}>
              <Input.Label required>City</Input.Label>
              <Input.Field placeholder="e.g. Chennai" {...register('permanentCity')} />
              <Input.Error />
            </Input>
            <Input error={errors.permanentState?.message}>
              <Input.Label required>State</Input.Label>
              <Input.Field placeholder="e.g. Tamil Nadu" {...register('permanentState')} />
              <Input.Error />
            </Input>
            <Input error={errors.permanentPincode?.message}>
              <Input.Label required>Pincode</Input.Label>
              <Input.Field type="text" inputMode="numeric" maxLength={6} placeholder="e.g. 600001" {...register('permanentPincode')} />
              <Input.Error />
            </Input>
          </div>
        </div>
      )}

      {showPreviousAddress && (
        <div className="space-y-6 pt-4 border-t border-surface-200">
          <h4 className="text-sm font-semibold text-gray-800">Previous Address (Required for &lt; 1 year)</h4>
          <Input error={errors.previousAddress?.message}>
            <Input.Label required>Previous Address Line 1</Input.Label>
            <Input.Field placeholder="House/Flat No., Building Name, Street" {...register('previousAddress')} />
            <Input.Error />
          </Input>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input error={errors.previousCity?.message}>
              <Input.Label required>City</Input.Label>
              <Input.Field placeholder="e.g. Jaipur" {...register('previousCity')} />
              <Input.Error />
            </Input>
            <Input error={errors.previousState?.message}>
              <Input.Label required>State</Input.Label>
              <Input.Field placeholder="e.g. Rajasthan" {...register('previousState')} />
              <Input.Error />
            </Input>
            <Input error={errors.previousPincode?.message}>
              <Input.Label required>Pincode</Input.Label>
              <Input.Field type="text" inputMode="numeric" maxLength={6} placeholder="e.g. 302001" {...register('previousPincode')} />
              <Input.Error />
            </Input>
          </div>
        </div>
      )}
    </div>
  );
});

export default Step4AddressDetails;
