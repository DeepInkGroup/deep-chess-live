import { createContext, useContext, useEffect, useState } from 'react';
import { getPalette, getStoredPaletteId, getStoredPieceSetId, setStoredPaletteId, setStoredPieceSetId } from '../lib/boardTheme';
import type { BoardPalette } from '../lib/boardTheme';
import { getCustomPieces } from '../lib/pieceSets';
import type { PieceSetId } from '../lib/pieceSets';

interface BoardThemeContextValue {
  palette: BoardPalette;
  paletteId: string;
  setPaletteId: (id: string) => void;
  pieceSetId: PieceSetId;
  setPieceSetId: (id: PieceSetId) => void;
  customPieces: ReturnType<typeof getCustomPieces>;
}

const BoardThemeContext = createContext<BoardThemeContextValue | null>(null);

export function BoardThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState(getStoredPaletteId);
  const [pieceSetId, setPieceSetIdState] = useState(() => getStoredPieceSetId() as PieceSetId);

  useEffect(() => {
    setStoredPaletteId(paletteId);
  }, [paletteId]);

  useEffect(() => {
    setStoredPieceSetId(pieceSetId);
  }, [pieceSetId]);

  return (
    <BoardThemeContext.Provider
      value={{
        palette: getPalette(paletteId),
        paletteId,
        setPaletteId: setPaletteIdState,
        pieceSetId,
        setPieceSetId: setPieceSetIdState,
        customPieces: getCustomPieces(pieceSetId),
      }}
    >
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme(): BoardThemeContextValue {
  const ctx = useContext(BoardThemeContext);
  if (!ctx) {
    return {
      palette: getPalette('classic'),
      paletteId: 'classic',
      setPaletteId: () => {},
      pieceSetId: 'classic',
      setPieceSetId: () => {},
      customPieces: undefined,
    };
  }
  return ctx;
}
