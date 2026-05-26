import {
  forwardRef, useRef, useImperativeHandle, useId,
} from 'react';
import SignaturePad from 'react-signature-canvas';
import clsx from 'clsx';

const SignatureCanvas = forwardRef((
  {
    label,
    error,
    helpText,
    required = false,
    onEnd,
    className,
  },
  ref,
) => {
  const generatedId = useId();
  const inputId = `signature-${generatedId}`;
  const padRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSignature: () => (padRef.current?.isEmpty() ? null : padRef.current?.toDataURL()),
    clear: () => padRef.current?.clear(),
  }));

  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor={inputId} className={clsx('form-label mb-0', { 'form-label-required': required })}>
            {label}
          </label>
          <button
            type="button"
            onClick={() => { padRef.current?.clear(); if (onEnd) onEnd(null); }}
            className="text-xs text-primary-500 hover:text-primary-700"
          >
            Clear
          </button>
        </div>
      )}
      <div className={clsx(
        'border rounded-xl bg-white overflow-hidden relative',
        error ? 'border-error-500' : 'border-surface-300',
      )}
      >
        {/* Anti-screen capture blur overlay effect can be implemented via CSS or wrapper */}
        <SignaturePad
          ref={padRef}
          canvasProps={{ id: inputId, className: 'w-full h-40 cursor-crosshair' }}
          onEnd={() => {
            if (onEnd) onEnd(padRef.current?.toDataURL());
          }}
        />
      </div>
      {error && <p className="text-xs text-error-500 mt-1.5">{error}</p>}
      {helpText && !error && <p className="form-help-text">{helpText}</p>}
    </div>
  );
});

export default SignatureCanvas;
