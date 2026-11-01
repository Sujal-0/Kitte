import { useState, useEffect } from 'react';
import { get, set, del } from 'idb-keyval';

export function useIDBState(key, defaultValue) {
  const [state, setState] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IDB on mount
  useEffect(() => {
    let isMounted = true;
    
    get(key).then(val => {
      if (isMounted) {
        if (val !== undefined) {
          setState(val);
        }
        setIsLoaded(true);
      }
    }).catch(err => {
      console.error(`Failed to load ${key} from IDB`, err);
      if (isMounted) {
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [key]);

  // Save to IDB whenever state changes (only AFTER initial load)
  useEffect(() => {
    if (isLoaded) {
      if (state === null || state === undefined) {
        del(key).catch(err => console.error(`Failed to delete ${key} from IDB`, err));
      } else {
        set(key, state).catch(err => console.error(`Failed to save ${key} to IDB`, err));
      }
    }
  }, [key, state, isLoaded]);

  return [state, setState, isLoaded];
}
