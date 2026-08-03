import { useEffect, useState } from 'react';

/** Shared board-sizing logic so a page can size a sibling element (e.g. the eval bar) to match the board exactly. */
export function useResponsiveBoardWidth(size?: number): number {
  const [width, setWidth] = useState(size ?? 480);

  useEffect(() => {
    if (size) {
      setWidth(size);
      return;
    }
    function update() {
      const vw = window.innerWidth;
      const target = Math.min(560, vw - (vw < 640 ? 48 : 96));
      setWidth(Math.max(260, target));
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [size]);

  return width;
}
