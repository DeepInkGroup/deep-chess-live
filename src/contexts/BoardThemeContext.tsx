import { createContext, useContext, useEffect, useState } from 'react';
import { getPalette, getStoredPaletteId, setStoredPaletteId } from '../lib/boardTheme';
import type { BoardPalette } from '../lib/boardTheme';

interface BoardThemeContextValue {
  palette: BoardPalette;
  paletteId: string;
  setPaletteId: (id: string) => void;
}

const BoardThemeContext = createContext<BoardThemeContextValue | null>(null);

export function BoardThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState(getStoredPaletteId);

  useEffect(() => {
    setStoredPaletteId(paletteId);
  }, [paletteId]);

  return (
    <BoardThemeContext.Provider value={{ palette: getPalette(paletteId), paletteId, setPaletteId: setPaletteIdState }}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme(): BoardThemeContextValue {
  const ctx = useContext(BoardThemeContext);
  if (!ctx) return { palette: getPalette('classic'), paletteId: 'classic', setPaletteId: () => {} };
  return ctx;
}
