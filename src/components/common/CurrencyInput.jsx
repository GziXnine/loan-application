import { forwardRef, useId, useState, useCallback } from 'react';
import clsx from 'clsx';
import ErrorMessage from './ErrorMessage';

const CurrencyInput = forwardRef(function CurrencyInput(
  {
    label,
    name,
    value: controlledValue,
    onChange,
    placeholder = '0',
    helpText,
    error,
    required = false,
    disabled = false,
    className,
    id: customId,
    min,
    max,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = customId || `currency-${name || generatedId}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  const [displayValue, setDisplayValue] = useState(() =>
    controlledValue ? formatIndianCurrency(controlledValue) : ''
  );

  function formatIndianCurrency(num) {
    if (!num && num !== 0) return '';
    const numStr = String(num).replace(/[^0-9]/g, '');
    if (!numStr) return '';
    const number = parseInt(numStr, 10);
    if (isNaN(number)) return '';
    return number.toLocaleString('en-IN');
  }

  const handleChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const formatted = formatIndianCurrency(rawValue);
    setDisplayValue(formatted);

    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, name, value: rawValue },
      };
      onChange(syntheticEvent);
    }
  }, [name, onChange]);

  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <label htmlFor={inputId} className={clsx('form-label', { 'form-label-required': required })}>
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
          ₹
        </div>
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={[error && errorId, helpText && helpId].filter(Boolean).join(' ') || undefined}
          className={clsx('form-input pl-8', { 'form-input-error': error, 'form-input-disabled': disabled })}
          {...rest}
        />
      </div>
      <ErrorMessage id={errorId} message={error} />
      {helpText && !error && (
        <p id={helpId} className="form-help-text">{helpText}</p>
      )}
    </div>
  );
});

export default CurrencyInput;
