import { useCallback, useEffect, useRef, useState } from 'react';
import { validateAadhaar, validatePAN } from '../utils/validators';

const validatorsByType = {
  pan: validatePAN,
  aadhaar: validateAadhaar,
};

const errorMessagesByType = {
  pan: 'Invalid PAN format',
  aadhaar: 'Invalid Aadhaar number',
};

export default function useVerification(value, type) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVerifying(false);
    setIsVerified(false);
    setError('');
  }, []);

  const triggerVerification = useCallback(() => {
    const validator = validatorsByType[type];
    if (!validator) return;
    if (!value) {
      setError('');
      setIsVerified(false);
      return;
    }

    if (!validator(value)) {
      setError(errorMessagesByType[type] || 'Invalid value');
      setIsVerified(false);
      return;
    }

    setError('');
    setIsVerifying(true);
    timerRef.current = setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  }, [type, value]);

  useEffect(() => {
    reset();
  }, [value, reset]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    isVerifying,
    isVerified,
    error,
    triggerVerification,
    reset,
  };
}
