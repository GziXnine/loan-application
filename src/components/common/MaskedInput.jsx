/** @format */

import {
  forwardRef, useId, useState, useCallback,
} from 'react';
import clsx from 'clsx';
import ErrorMessage from './ErrorMessage';

const MaskedInput = forwardRef((
  {
    label,
    name,
    value: controlledValue,
    onChange,
    placeholder,
    helpText,
    error,
    required = false,
    disabled = false,
    maskType = 'pan', // 'pan' | 'aadhaar'
    className,
    id: customId,
    ...rest
  },
  ref,
) => {
  const generatedId = useId();
  const inputId = customId || `masked-${name || generatedId}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  const [isMasked, setIsMasked] = useState(true);

  const formatValue = useCallback(
    (val) => {
      if (!val) return '';
      if (maskType === 'pan') {
        return val
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 10);
      }
      if (maskType === 'aadhaar') {
        return val.replace(/[^0-9]/g, '').slice(0, 12);
      }
      return val;
    },
    [maskType],
  );

  const getDisplayValue = useCallback(
    (val) => {
      if (!val) return '';
      if (!isMasked) return val;

      if (maskType === 'pan' && val.length > 4) {
        return '*'.repeat(val.length - 4) + val.slice(-4);
      }
      if (maskType === 'aadhaar' && val.length > 4) {
        return '*'.repeat(val.length - 4) + val.slice(-4);
      }
      return val;
    },
    [isMasked, maskType],
  );

  const handleChange = (e) => {
    const formatted = formatValue(e.target.value);
    if (onChange) {
      e.target.value = formatted;
      onChange(e);
    }
  };

  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={clsx('form-label', { 'form-label-required': required })}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          value={getDisplayValue(controlledValue)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(' ')
            || undefined
          }
          className={clsx('form-input pr-12', { 'form-input-error': error })}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setIsMasked(!isMasked)}
          className="absolute right-3 p-1 text-gray-500 hover:text-gray-700"
          tabIndex="-1"
        >
          {isMasked ? '👁️' : '🙈'}
        </button>
      </div>
      <ErrorMessage id={errorId} message={error} />
      {helpText && !error && (
        <p id={helpId} className="form-help-text">
          {helpText}
        </p>
      )}
    </div>
  );
});

export default MaskedInput;
