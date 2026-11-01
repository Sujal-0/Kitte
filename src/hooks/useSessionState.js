import { useState, useEffect } from 'react';

export function useSessionState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading sessionStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (state === null || state === undefined) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn('Error setting sessionStorage', error);
    }
  }, [key, state]);

  return [state, setState];
}
