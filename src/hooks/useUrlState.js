import { useState, useEffect, useCallback } from 'react';

export function useUrlState(key, initialValue) {
  const getUrlValue = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }, [key]);

  const [state, setState] = useState(() => {
    const urlValue = getUrlValue();
    return urlValue !== null ? urlValue : initialValue;
  });

  const setUrlState = useCallback((newValue) => {
    setState(newValue);
    const url = new URL(window.location);
    if (newValue === null || newValue === undefined || newValue === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, newValue);
    }
    // Update the URL without reloading the page
    window.history.pushState({}, '', url);
  }, [key]);

  useEffect(() => {
    const handlePopState = () => {
      const urlValue = getUrlValue();
      setState(urlValue !== null ? urlValue : initialValue);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getUrlValue, initialValue]);

  return [state, setUrlState];
}

export function useUrlStateBool(key, initialValue = false) {
  const [val, setVal] = useUrlState(key, initialValue ? 'true' : null);
  
  const boolVal = val === 'true';
  
  const setBoolVal = useCallback((newBool) => {
    setVal(newBool ? 'true' : null);
  }, [setVal]);

  return [boolVal, setBoolVal];
}
