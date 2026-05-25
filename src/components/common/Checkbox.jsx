import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import ErrorMessage from './ErrorMessage';

/**
 * Checkbox Component
 * 
 * Reusable checkbox with linked label.
 * - Custom styled checkbox with animation
 * - forwardRef for React Hook Form
 * - Supports description text below label
 */
const Checkbox = forwardRef(function Checkbox(
  {
    label,
    name,
    checked,
    onChange,
    error,
    helpText,
    required = false,
    disabled = false,
    description,
    className,
    id: customId,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const checkboxId = customId || `checkbox-${name || generatedId}`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className={clsx('form-field', className)}>
      <div className="flex items-start gap-3">
        {/* Custom Checkbox */}
        <div className="flex items-center h-6 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              'w-5 h-5 rounded-md border-2 cursor-pointer',
              'transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'checked:bg-primary-500 checked:border-primary-500',
              {
                'border-surface-300 hover:border-primary-300': !error,
                'border-error-500': error,
                'opacity-50 cursor-not-allowed': disabled,
              }
            )}
            {...rest}
          />
        </div>

        {/* Label & Description */}
        <div className="flex-1">
          <label
            htmlFor={checkboxId}
            className={clsx(
              'text-sm text-gray-700 cursor-pointer select-none',
              { 'font-medium': !description }
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Error */}
      <ErrorMessage id={errorId} message={error} className="ml-8" />

      {/* Help Text */}
      {helpText && !error && (
        <p className="form-help-text ml-8 mt-1">{helpText}</p>
      )}
    </div>
  );
});

export default Checkbox;
