import { forwardRef, useId } from 'react';
import clsx from 'clsx';

/**
 * Input Component
 * 
 * Reusable text input with:
 * - Label, help text, and error message support
 * - forwardRef for React Hook Form's register
 * - Controlled and uncontrolled modes
 * - WCAG 2.1 AA compliant (associated labels, aria attributes)
 * - Multiple visual states: default, error, success, disabled
 */
const Input = forwardRef(function Input(
  {
    label,
    name,
    type = 'text',
    placeholder,
    helpText,
    error,
    success,
    required = false,
    disabled = false,
    className,
    inputClassName,
    leftIcon,
    rightIcon,
    id: customId,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = customId || `input-${name || generatedId}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className={clsx('form-field', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={clsx('form-label', { 'form-label-required': required })}
        >
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(' ') || undefined
          }
          className={clsx(
            'form-input',
            {
              'form-input-error': error,
              'form-input-success': success && !error,
              'form-input-disabled': disabled,
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            inputClassName
          )}
          {...rest}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
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

export default Input;
