import { forwardRef, useId } from 'react';
import clsx from 'clsx';

/**
 * Select Component
 * 
 * Reusable select dropdown with:
 * - Native select element for accessibility
 * - Label, help text, and error message support
 * - forwardRef for React Hook Form
 * - Placeholder option support
 */
const Select = forwardRef(function Select(
  {
    label,
    name,
    options = [],
    placeholder = 'Select an option',
    helpText,
    error,
    required = false,
    disabled = false,
    className,
    id: customId,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const selectId = customId || `select-${name || generatedId}`;
  const helpId = `${selectId}-help`;
  const errorId = `${selectId}-error`;

  return (
    <div className={clsx('form-field', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={clsx('form-label', { 'form-label-required': required })}
        >
          {label}
        </label>
      )}

      {/* Select */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(' ') || undefined
          }
          className={clsx(
            'form-input appearance-none pr-10 cursor-pointer',
            {
              'form-input-error': error,
              'form-input-disabled': disabled,
              'text-gray-400': !rest.value && !rest.defaultValue,
            }
          )}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-xs text-error-500 mt-1.5 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p id={helpId} className="form-help-text">
          {helpText}
        </p>
      )}
    </div>
  );
});

export default Select;
