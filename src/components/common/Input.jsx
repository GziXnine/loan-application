/** @format */

import React, {
  createContext, useContext, forwardRef, useMemo,
} from 'react';
import clsx from 'clsx';
import ErrorMessage from './ErrorMessage';

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
const Input = forwardRef(({
  name, error, children, className,
}, ref) => {
  const contextValue = useMemo(() => ({ name, error }), [name, error]);
  return (
    <InputContext.Provider value={contextValue}>
      <div className={clsx('form-field', className)} ref={ref}>
        {children}
      </div>
    </InputContext.Provider>
  );
});

Input.Label = function InputLabel({
  children, required, htmlFor, className,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        'form-label',
        { 'form-label-required': required },
        className,
      )}
    >
      {children}
    </label>
  );
};

Input.Field = forwardRef(
  (
    {
      id,
      type = 'text',
      placeholder,
      disabled,
      leftIcon,
      rightIcon,
      className,
      ...rest
    },
    ref,
  ) => {
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
            className,
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
  },
);

Input.Error = function InputError() {
  const { error } = useContext(InputContext);
  return <ErrorMessage message={error} />;
};

Input.HelpText = function InputHelpText({ children }) {
  const { error } = useContext(InputContext);
  if (error || !children) return null;
  return <p className="form-help-text mt-1.5">{children}</p>;
};

export default Input;
