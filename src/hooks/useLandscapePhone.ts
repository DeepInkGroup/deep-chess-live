import { useEffect, useState } from 'react';

const QUERY = '(orientation: landscape) and (max-height: 500px)';

/** True when the viewport looks like a phone rotated to landscape (short height, wide-ish). */
export function useLandscapePhone(): boolean {
  const [isLandscapePhone, setIsLandscapePhone] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false));

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setIsLandscapePhone(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isLandscapePhone;
}
