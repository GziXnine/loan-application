import { useEffect, useState } from 'react';
import pinCodeData from '../utils/pinCodeData.json';

export default function usePinCodeLookup(pincode) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pincode || pincode.length !== 6) {
      setCity('');
      setState('');
      setPostOffice('');
      setIsLoading(false);
      setError('');
      return undefined;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError('Invalid pincode');
      setCity('');
      setState('');
      setPostOffice('');
      return undefined;
    }

    setIsLoading(true);
    setError('');

    const timer = setTimeout(() => {
      const match = pinCodeData.find((entry) => entry.pincode === pincode);
      if (!match) {
        setError('Pincode not found in sample dataset');
        setCity('');
        setState('');
        setPostOffice('');
      } else {
        setCity(match.city);
        setState(match.state);
        setPostOffice(match.postOffice);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pincode]);

  return {
    city,
    state,
    postOffice,
    isLoading,
    error,
  };
}
