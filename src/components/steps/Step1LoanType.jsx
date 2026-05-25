/** @format */

import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSchemaForStep } from "../../utils/schemaFactory";
import useLoanStore from "../../store/loanStore";
import RadioGroup from "../common/RadioGroup";
import CurrencyInput from "../common/CurrencyInput";
import Select from "../common/Select";
import Input from "../common/Input";

const Step1LoanType = forwardRef((props, ref) => {
  const stepData = useLoanStore((state) => state.getStepData(1));
  const updateStepData = useLoanStore((state) => state.updateStepData);
  const formData = useLoanStore((state) => state.formData);

  const resolver = useMemo(
    () => zodResolver(getSchemaForStep(1, formData)),
    [formData],
  );

  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: stepData,
    mode: "onChange",
  });

  const loanType = watch("loanType");
  const loanTenureValue = watch("loanTenure");

  const loanConstraints = {
    personal: {
      minAmount: 10000,
      maxAmount: 2000000,
      minTenure: 6,
      maxTenure: 60,
    },
    home: {
      minAmount: 500000,
      maxAmount: 50000000,
      minTenure: 60,
      maxTenure: 360,
    },
    business: {
      minAmount: 100000,
      maxAmount: 20000000,
      minTenure: 12,
      maxTenure: 120,
    },
  };

  const currentConstraints =
    loanConstraints[loanType] || loanConstraints.personal;

  const buildTenureOptions = (min, max) => {
    const options = [];
    const step = min < 12 ? 6 : 12;
    for (let i = min; i <= max; i += step) {
      options.push({
        value: String(i),
        label: `${i} Months (${Math.round(i / 12)} Years)`,
      });
    }
    return options;
  };

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
    {
      value: "personal",
      label: "Personal Loan",
      icon: "👤",
      description: "For personal expenses",
    },
    {
      value: "home",
      label: "Home Loan",
      icon: "🏠",
      description: "For buying a house",
    },
    {
      value: "business",
      label: "Business Loan",
      icon: "💼",
      description: "For business expansion",
    },
  ];

  const tenureOptions = buildTenureOptions(
    currentConstraints.minTenure,
    currentConstraints.maxTenure,
  );

  useEffect(() => {
    if (!loanTenureValue) return;
    const tenure = Number(loanTenureValue);
    if (Number.isNaN(tenure)) return;
    if (
      tenure < currentConstraints.minTenure ||
      tenure > currentConstraints.maxTenure
    ) {
      setValue("loanTenure", "");
    }
  }, [
    loanTenureValue,
    currentConstraints.minTenure,
    currentConstraints.maxTenure,
    setValue,
  ]);

  const loanPurposeOptions = [
    { value: "debt_consolidation", label: "Debt Consolidation" },
    { value: "home_improvement", label: "Home Improvement" },
    { value: "medical_emergency", label: "Medical Emergency" },
    { value: "education", label: "Education" },
    { value: "wedding", label: "Wedding" },
    { value: "business_expansion", label: "Business Expansion" },
    { value: "vehicle_purchase", label: "Vehicle Purchase" },
    { value: "other", label: "Other" },
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
              min={currentConstraints.minAmount}
              max={currentConstraints.maxAmount}
              helpText={`Range: ₹${currentConstraints.minAmount.toLocaleString("en-IN")} - ₹${currentConstraints.maxAmount.toLocaleString("en-IN")}`}
              error={errors.loanAmount?.message}
              {...field}
            />
          )}
        />

        <Select
          label="Loan Tenure"
          options={tenureOptions}
          required
          helpText={`Allowed: ${currentConstraints.minTenure}-${currentConstraints.maxTenure} months`}
          error={errors.loanTenure?.message}
          {...register("loanTenure")}
        />
      </div>

      <div className="pt-2">
        <Select
          label="Purpose of Loan"
          options={loanPurposeOptions}
          placeholder="Select purpose"
          required
          variant="custom"
          error={errors.loanPurpose?.message}
          {...register("loanPurpose")}
        />
      </div>
    </div>
  );
});

export default Step1LoanType;
