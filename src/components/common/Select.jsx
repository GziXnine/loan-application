/** @format */

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import ErrorMessage from "./ErrorMessage";

/**
 * Select Component
 *
 * Supports:
 * - Native select element (default)
 * - Custom dropdown variant with keyboard support
 * - Label, help text, and error message support
 * - forwardRef for React Hook Form
 */
const Select = forwardRef(function Select(
  {
    label,
    name,
    options = [],
    placeholder = "Select an option",
    helpText,
    error,
    required = false,
    disabled = false,
    className,
    id: customId,
    variant = "native",
    value,
    defaultValue,
    onChange,
    onBlur,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = customId || `select-${name || generatedId}`;
  const helpId = `${selectId}-help`;
  const errorId = `${selectId}-error`;
  const listboxId = `${selectId}-listbox`;
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const currentValue = isControlled ? value : internalValue;
  const selectedOption = useMemo(
    () =>
      options.find((option) => String(option.value) === String(currentValue)),
    [options, currentValue],
  );

  const getNextEnabledIndex = (startIndex, direction) => {
    if (!options.length) return -1;
    const total = options.length;
    let index = startIndex;
    for (let i = 0; i < total; i += 1) {
      index = (index + direction + total) % total;
      if (!options[index].disabled) return index;
    }
    return startIndex;
  };

  const closeListbox = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    if (onBlur) {
      onBlur({ target: { name, value: currentValue } });
    }
  };

  const openListbox = (index) => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(index);
  };

  const selectOption = (option) => {
    if (disabled || option.disabled) return;
    if (!isControlled) {
      setInternalValue(option.value);
    }
    if (onChange) {
      onChange({ target: { name, value: option.value } });
    }
    closeListbox();
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        closeListbox();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue ?? "");
    }
  }, [defaultValue, isControlled]);

  const handleButtonKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(isOpen ? focusedIndex : -1, 1);
      if (!isOpen) openListbox(nextIndex);
      else setFocusedIndex(nextIndex);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(isOpen ? focusedIndex : 0, -1);
      if (!isOpen) openListbox(nextIndex);
      else setFocusedIndex(nextIndex);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) {
        const nextIndex = getNextEnabledIndex(-1, 1);
        openListbox(nextIndex);
      } else if (focusedIndex >= 0) {
        selectOption(options[focusedIndex]);
      }
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeListbox();
    }
  };

  const handleListKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex(getNextEnabledIndex(focusedIndex, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex(getNextEnabledIndex(focusedIndex, -1));
    }
    if (event.key === "Enter" && focusedIndex >= 0) {
      event.preventDefault();
      selectOption(options[focusedIndex]);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeListbox();
      buttonRef.current?.focus();
    }
  };

  if (variant === "custom") {
    return (
      <div className={clsx("form-field", className)} ref={wrapperRef}>
        {label && (
          <label
            htmlFor={selectId}
            className={clsx("form-label", { "form-label-required": required })}
          >
            {label}
          </label>
        )}

        <button
          id={selectId}
          ref={buttonRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(" ") ||
            undefined
          }
          onClick={() =>
            isOpen ? closeListbox() : openListbox(getNextEnabledIndex(-1, 1))
          }
          onKeyDown={handleButtonKeyDown}
          className={clsx(
            "form-input flex items-center justify-between pr-10 text-left",
            {
              "form-input-error": error,
              "form-input-disabled": disabled,
              "text-gray-400": !selectedOption,
            },
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            onKeyDown={handleListKeyDown}
            className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-surface-200 bg-white shadow-card"
          >
            {options.map((option, index) => {
              const isSelected = String(option.value) === String(currentValue);
              const isFocused = index === focusedIndex;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={clsx("px-4 py-2 text-sm cursor-pointer", {
                    "bg-primary-50 text-primary-700": isSelected,
                    "bg-surface-100": isFocused && !isSelected,
                    "text-gray-400 cursor-not-allowed": option.disabled,
                  })}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        )}

        <input
          ref={ref}
          type="hidden"
          name={name}
          value={currentValue}
          onBlur={onBlur}
          {...rest}
        />

        <ErrorMessage id={errorId} message={error} />

        {helpText && !error && (
          <p id={helpId} className="form-help-text">
            {helpText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={clsx("form-field", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className={clsx("form-label", { "form-label-required": required })}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(" ") ||
            undefined
          }
          className={clsx("form-input appearance-none pr-10 cursor-pointer", {
            "form-input-error": error,
            "form-input-disabled": disabled,
            "text-gray-400": !currentValue,
          })}
          value={currentValue}
          onChange={(event) => {
            if (!isControlled) {
              setInternalValue(event.target.value);
            }
            if (onChange) onChange(event);
          }}
          onBlur={onBlur}
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

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
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

export default Select;
