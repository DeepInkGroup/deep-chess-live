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
      const vh = window.innerHeight;
      const widthTarget = Math.min(560, vw - (vw < 640 ? 48 : 96));
      // Leave room for the header, page title/controls, and player badges when the viewport is short
      // (e.g. a phone in landscape) so the board never forces the page to scroll vertically.
      const heightTarget = vh - 220;
      setWidth(Math.max(220, Math.min(widthTarget, heightTarget > 0 ? heightTarget : widthTarget)));
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [size]);

  return width;
}
