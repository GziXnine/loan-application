/** @format */

import clsx from 'clsx';

export default function ErrorMessage({
  id,
  message,
  className,
  ariaLive = 'polite',
  role = 'alert',
}) {
  if (!message) return null;

  return (
    <p
      id={id}
      className={clsx(
        'flex items-center gap-1 text-xs text-error-500 mt-1.5 animate-fade-in',
        className,
      )}
      role={role}
      aria-live={ariaLive}
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}
