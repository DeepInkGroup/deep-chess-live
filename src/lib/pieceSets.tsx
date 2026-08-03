type CustomPieceFn = (args: { isDragging: boolean; squareWidth: number }) => React.ReactElement;

export type PieceSetId = 'classic' | 'minimal';

export const PIECE_SETS: { id: PieceSetId; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
];

const LETTERS: Record<string, string> = { K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P' };
const CODES = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'] as const;

function minimalPiece(code: (typeof CODES)[number]): CustomPieceFn {
  const isWhite = code[0] === 'w';
  const letter = LETTERS[code[1]];
  const fill = isWhite ? '#e9ecf5' : '#232840';
  const stroke = isWhite ? '#232840' : '#e9ecf5';
  return ({ squareWidth }) => (
    <svg viewBox="0 0 100 100" width={squareWidth * 0.82} height={squareWidth * 0.82} style={{ pointerEvents: 'none' }}>
      <circle cx="50" cy="50" r="42" fill={fill} stroke={stroke} strokeWidth="4" />
      <text x="50" y="54" textAnchor="middle" fontSize="46" fontFamily="Georgia, serif" fontWeight={700} fill={stroke}>
        {letter}
      </text>
    </svg>
  );
}

const MINIMAL_PIECES = Object.fromEntries(CODES.map((code) => [code, minimalPiece(code)]));

export function getCustomPieces(setId: PieceSetId) {
  if (setId === 'minimal') return MINIMAL_PIECES;
  return undefined;
}
