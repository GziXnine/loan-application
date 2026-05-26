/** @format */

import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import ErrorMessage from './ErrorMessage';

/**
 * RadioGroup Component
 *
 * Reusable radio button group with:
 * - Horizontal and vertical layout options
 * - Card-style radio buttons for better UX
 * - forwardRef for React Hook Form
 * - WCAG 2.1 AA accessible via fieldset/legend
 */
const RadioGroup = forwardRef((
  {
    label,
    name,
    options = [],
    value,
    onChange,
    error,
    helpText,
    required = false,
    disabled = false,
    layout = 'horizontal', // 'horizontal' | 'vertical' | 'cards'
    className,
    ...rest
  },
  ref,
) => {
  const generatedId = useId();
  const groupId = `radio-group-${name || generatedId}`;
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      className={clsx('form-field', className)}
      aria-describedby={error ? errorId : undefined}
    >
      {/* Legend / Label */}
      {label && (
        <legend
          className={clsx('form-label', { 'form-label-required': required })}
        >
          {label}
        </legend>
      )}

      {/* Radio Options */}
      <div
        className={clsx({
          'flex flex-wrap gap-3': layout === 'horizontal',
          'flex flex-col gap-2': layout === 'vertical',
          'grid grid-cols-2 sm:grid-cols-3 gap-3': layout === 'cards',
        })}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isSelected = value === option.value;

          if (layout === 'cards') {
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={clsx(
                  'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer',
                  'transition-all duration-200 ease-out',
                  'hover:shadow-soft',
                  {
                    'border-primary-500 bg-primary-50/50 shadow-glow-primary':
                      isSelected,
                    'border-surface-200 bg-white hover:border-primary-200':
                      !isSelected,
                    'opacity-50 cursor-not-allowed':
                      disabled || option.disabled,
                  },
                )}
              >
                <input
                  ref={isSelected ? ref : undefined}
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={onChange}
                  disabled={disabled || option.disabled}
                  className="sr-only"
                  {...rest}
                />
                {option.icon && (
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span
                  className={clsx(
                    'text-sm font-medium text-center',
                    isSelected ? 'text-primary-700' : 'text-gray-700',
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-2xs text-gray-500 text-center">
                    {option.description}
                  </span>
                )}
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          }

          // Standard radio layout (horizontal/vertical)
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={clsx(
                'flex items-center gap-2 cursor-pointer group',
                'min-h-[44px] px-3 py-2 rounded-lg',
                'transition-colors duration-150',
                'hover:bg-surface-50',
                {
                  'opacity-50 cursor-not-allowed': disabled || option.disabled,
                },
              )}
            >
              <input
                ref={isSelected ? ref : undefined}
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={onChange}
                disabled={disabled || option.disabled}
                className={clsx(
                  'w-4 h-4 border-2 rounded-full appearance-none cursor-pointer',
                  'transition-all duration-200',
                  'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  {
                    'border-primary-500 bg-primary-500 shadow-[inset_0_0_0_3px_white]':
                      isSelected,
                    'border-surface-300 group-hover:border-primary-300':
                      !isSelected,
                  },
                )}
                {...rest}
              />
              <span
                className={clsx(
                  'text-sm',
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700',
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Error Message */}
      <ErrorMessage id={errorId} message={error} />

      {/* Help Text */}
      {helpText && !error && (
        <p className="form-help-text mt-1.5">{helpText}</p>
      )}
    </fieldset>
  );
});

export default RadioGroup;
