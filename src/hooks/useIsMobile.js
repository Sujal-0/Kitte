import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile viewport (< breakpoint px).
 * Defaults to 1024px (Tailwind 'lg' breakpoint).
 */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const updateMatch = (e) => setIsMobile(e.matches);

    // Initial check
    setIsMobile(query.matches);

    if (query.addEventListener) {
      query.addEventListener('change', updateMatch);
      return () => query.removeEventListener('change', updateMatch);
    } else {
      // Legacy fallback
      query.addListener(updateMatch);
      return () => query.removeListener(updateMatch);
    }
  }, [breakpoint]);

  return isMobile;
}
