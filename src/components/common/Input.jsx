import React, { createContext, useContext, forwardRef } from 'react';
import clsx from 'clsx';

const InputContext = createContext();

/**
 * Compound Input Component
 * Usage:
 * <Input error={errors.name?.message}>
 *   <Input.Label required>Name</Input.Label>
 *   <Input.Field {...register('name')} placeholder="Enter name" />
 *   <Input.Error />
 *   <Input.HelpText>Some help</Input.HelpText>
 * </Input>
 */
const Input = forwardRef(({ name, error, children, className }, ref) => {
  return (
    <InputContext.Provider value={{ name, error }}>
      <div className={clsx('form-field', className)} ref={ref}>
        {children}
      </div>
    </InputContext.Provider>
  );
});

Input.Label = function InputLabel({ children, required, htmlFor, className }) {
  return (
    <label htmlFor={htmlFor} className={clsx('form-label', { 'form-label-required': required }, className)}>
      {children}
    </label>
  );
};

Input.Field = forwardRef(({ id, type = 'text', placeholder, disabled, leftIcon, rightIcon, className, ...rest }, ref) => {
  const { error } = useContext(InputContext);
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={clsx(
          'form-input',
          {
            'form-input-error': error,
            'form-input-disabled': disabled,
            'pl-10': leftIcon,
            'pr-10': rightIcon,
          },
          className
        )}
        {...rest}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
});

Input.Error = function InputError() {
  const { error } = useContext(InputContext);
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-error-500 mt-1.5 animate-fade-in" role="alert">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </p>
  );
};

Input.HelpText = function InputHelpText({ children }) {
  const { error } = useContext(InputContext);
  if (error || !children) return null;
  return <p className="form-help-text mt-1.5">{children}</p>;
};

export default Input;
