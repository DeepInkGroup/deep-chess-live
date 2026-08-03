export interface BoardPalette {
  id: string;
  name: string;
  dark: string;
  light: string;
}

export const BOARD_PALETTES: BoardPalette[] = [
  { id: 'classic', name: 'Classic', dark: '#6b7a99', light: '#e4e8f3' },
  { id: 'walnut', name: 'Walnut', dark: '#8b5a3c', light: '#e8d3b5' },
  { id: 'emerald', name: 'Emerald', dark: '#4b7f6b', light: '#dcecdf' },
  { id: 'slate', name: 'Slate', dark: '#4d5566', light: '#d6dae2' },
  { id: 'coral', name: 'Coral', dark: '#b5615a', light: '#f3ded9' },
];

const KEY = 'deepchess.boardTheme.v1';
const PIECE_SET_KEY = 'deepchess.pieceSet.v1';

export function getStoredPaletteId(): string {
  try {
    return localStorage.getItem(KEY) ?? 'classic';
  } catch {
    return 'classic';
  }
}

export function setStoredPaletteId(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* localStorage unavailable */
  }
}

export function getPalette(id: string): BoardPalette {
  return BOARD_PALETTES.find((p) => p.id === id) ?? BOARD_PALETTES[0];
}

export function getStoredPieceSetId(): string {
  try {
    return localStorage.getItem(PIECE_SET_KEY) ?? 'classic';
  } catch {
    return 'classic';
  }
}

export function setStoredPieceSetId(id: string) {
  try {
    localStorage.setItem(PIECE_SET_KEY, id);
  } catch {
    /* localStorage unavailable */
  }
}
