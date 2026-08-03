import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Eraser, RotateCcw } from 'lucide-react';
import { useBoardTheme } from '../contexts/BoardThemeContext';
import { START_FEN } from '../lib/chess';

type PieceCode = string; // e.g. "wP", "bK"
type Position = Partial<Record<string, PieceCode>>;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const PIECE_ORDER: PieceCode[] = ['K', 'Q', 'R', 'B', 'N', 'P'];

const PIECE_GLYPH: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

function fenToPosition(fen: string): Position {
  const pos: Position = {};
  const placement = fen.split(' ')[0];
  const rows = placement.split('/');
  rows.forEach((row, rankIdx) => {
    let fileIdx = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        fileIdx += Number(ch);
      } else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b';
        const square = FILES[fileIdx] + RANKS[rankIdx];
        pos[square] = color + ch.toUpperCase();
        fileIdx++;
      }
    }
  });
  return pos;
}

function positionToPlacement(pos: Position): string {
  return RANKS.map((rank) => {
    let row = '';
    let empty = 0;
    for (const file of FILES) {
      const piece = pos[file + rank];
      if (!piece) {
        empty++;
        continue;
      }
      if (empty > 0) {
        row += empty;
        empty = 0;
      }
      const letter = piece[1];
      row += piece[0] === 'w' ? letter : letter.toLowerCase();
    }
    if (empty > 0) row += empty;
    return row;
  }).join('/');
}

interface BoardEditorProps {
  initialFen?: string;
  onDone: (fen: string) => void;
  onCancel: () => void;
}

export default function BoardEditor({ initialFen, onDone, onCancel }: BoardEditorProps) {
  const { palette, customPieces } = useBoardTheme();
  const [position, setPosition] = useState<Position>(() => fenToPosition(initialFen ?? START_FEN));
  const [turn, setTurn] = useState<'w' | 'b'>(initialFen ? (initialFen.split(' ')[1] === 'b' ? 'b' : 'w') : 'w');
  const [armed, setArmed] = useState<PieceCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const boardPosition = position as Record<string, string>;

  function handleSquareClick(square: string) {
    setPosition((prev) => {
      const next = { ...prev };
      if (armed === 'erase') {
        delete next[square];
      } else if (armed) {
        next[square] = armed;
      } else {
        return prev;
      }
      return next;
    });
  }

  function reset() {
    setPosition(fenToPosition(START_FEN));
    setTurn('w');
    setError(null);
  }

  function clear() {
    setPosition({});
    setError(null);
  }

  function finish() {
    const placement = positionToPlacement(position);
    const fen = `${placement} ${turn} - - 0 1`;
    const test = new Chess();
    try {
      test.load(fen);
    } catch {
      setError('Invalid position — check that both kings are on the board.');
      return;
    }
    onDone(test.fen());
  }

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
      <div className="inline-block rounded-2xl border border-white/8 bg-ink-900/60 p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] sm:p-3">
        <Chessboard
          position={boardPosition}
          boardWidth={420}
          arePiecesDraggable={false}
          showBoardNotation
          customBoardStyle={{ borderRadius: '10px' }}
          customDarkSquareStyle={{ backgroundColor: palette.dark }}
          customLightSquareStyle={{ backgroundColor: palette.light }}
          customPieces={customPieces}
          onSquareClick={handleSquareClick}
        />
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Place pieces — click a piece, then a square</p>
          <div className="grid grid-cols-6 gap-1.5">
            {(['w', 'b'] as const).map((color) =>
              PIECE_ORDER.map((letter) => {
                const code = color + letter;
                return (
                  <button
                    key={code}
                    onClick={() => setArmed(armed === code ? null : code)}
                    className={`flex h-10 items-center justify-center rounded-lg border text-2xl leading-none transition-colors ${
                      armed === code ? 'border-gold-500/50 bg-gold-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                    style={{ color: color === 'w' ? '#e2e5f0' : '#5b6482' }}
                  >
                    {PIECE_GLYPH[code]}
                  </button>
                );
              }),
            )}
            <button
              onClick={() => setArmed(armed === 'erase' ? null : 'erase')}
              className={`col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-colors ${
                armed === 'erase' ? 'border-ruby-500/50 bg-ruby-500/15 text-ruby-400' : 'border-white/10 bg-white/5 text-ink-300 hover:bg-white/10'
              }`}
            >
              <Eraser size={14} /> Erase
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Side to move</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTurn('w')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${turn === 'w' ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'}`}
            >
              White
            </button>
            <button
              onClick={() => setTurn('b')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${turn === 'b' ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'}`}
            >
              Black
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-ruby-400">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            <RotateCcw size={15} /> Start position
          </button>
          <button onClick={clear} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            <Eraser size={15} /> Clear board
          </button>
          <button onClick={onCancel} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            Cancel
          </button>
          <button onClick={finish} className="rounded-lg bg-gold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 hover:bg-gold-400">
            Use position
          </button>
        </div>
      </div>
    </div>
  );
}
