import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import BoardPanel from './BoardPanel';
import { applyUci, derivePuzzlePosition, turnColorFromFen } from '../lib/chess';
import type { LichessPuzzle } from '../types/lichess';

type Status = 'solving' | 'wrong' | 'complete' | 'opponent-move' | 'failed';

interface PuzzleBoardProps {
  puzzle: LichessPuzzle;
  /** In strict mode, a single wrong move ends the puzzle instead of allowing retries. */
  strict?: boolean;
  onSolved?: () => void;
  onFailed?: () => void;
}

export default function PuzzleBoard({ puzzle, strict = false, onSolved, onFailed }: PuzzleBoardProps) {
  const chessRef = useRef<Chess | null>(null);
  const [fen, setFen] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [status, setStatus] = useState<Status>('solving');
  const [resetKey, setResetKey] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const resultFired = useRef(false);

  const startPosition = useMemo(() => derivePuzzlePosition(puzzle.puzzle, puzzle.game.pgn), [puzzle]);
  const solverColor = useMemo(() => turnColorFromFen(startPosition.fen), [startPosition]);

  useEffect(() => {
    const chess = new Chess();
    chess.load(startPosition.fen);
    chessRef.current = chess;
    setFen(chess.fen());
    setLastMove(startPosition.lastMove);
    setSolutionIndex(0);
    setStatus('solving');
    setSelected(undefined);
    resultFired.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, resetKey]);

  function fireResult(solved: boolean) {
    if (resultFired.current) return;
    resultFired.current = true;
    if (solved) onSolved?.();
    else onFailed?.();
  }

  function attemptMove(from: string, to: string): boolean {
    if (!chessRef.current || status === 'complete' || status === 'failed') return false;
    const chess = chessRef.current;
    const expected = puzzle.puzzle.solution[solutionIndex];
    const expectedFrom = expected.slice(0, 2);
    const expectedTo = expected.slice(2, 4);

    if (from !== expectedFrom || to !== expectedTo) {
      if (strict) {
        setStatus('failed');
        fireResult(false);
      } else {
        setStatus('wrong');
        setTimeout(() => setStatus('solving'), 700);
      }
      return false;
    }

    let move;
    try {
      move = applyUci(chess, expected);
    } catch {
      setStatus('wrong');
      return false;
    }
    if (!move) return false;

    setFen(chess.fen());
    setLastMove(expected);
    const nextIndex = solutionIndex + 1;

    if (nextIndex >= puzzle.puzzle.solution.length) {
      setSolutionIndex(nextIndex);
      setStatus('complete');
      fireResult(true);
      return true;
    }

    setStatus('opponent-move');
    const replyUci = puzzle.puzzle.solution[nextIndex];
    setTimeout(() => {
      try {
        applyUci(chess, replyUci);
        setFen(chess.fen());
        setLastMove(replyUci);
      } catch {
        /* ignore */
      }
      const afterReply = nextIndex + 1;
      setSolutionIndex(afterReply);
      if (afterReply >= puzzle.puzzle.solution.length) {
        setStatus('complete');
        fireResult(true);
      } else {
        setStatus('solving');
      }
    }, 500);

    return true;
  }

  function handleDrop(from: string, to: string): boolean {
    setSelected(undefined);
    return attemptMove(from, to);
  }

  function handleSquareClick(square: string) {
    if (status !== 'solving' || !chessRef.current) return;
    const solverChessColor = solverColor === 'white' ? 'w' : 'b';
    const piece = chessRef.current.get(square as Parameters<Chess['get']>[0]);

    if (!selected) {
      if (piece && piece.color === solverChessColor) setSelected(square);
      return;
    }
    if (selected === square) {
      setSelected(undefined);
      return;
    }
    if (piece && piece.color === solverChessColor) {
      setSelected(square);
      return;
    }
    attemptMove(selected, square);
    setSelected(undefined);
  }

  if (!fen) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <BoardPanel
        fen={fen}
        orientation={solverColor}
        lastMoveUci={lastMove}
        interactive={status === 'solving'}
        onDrop={handleDrop}
        selectedSquare={selected}
        onSquareClick={handleSquareClick}
      />
      <StatusBanner status={status} strict={strict} onRetry={() => setResetKey((k) => k + 1)} />
    </div>
  );
}

function StatusBanner({ status, strict, onRetry }: { status: Status; strict: boolean; onRetry: () => void }) {
  if (status === 'complete') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
        <CheckCircle2 size={18} /> Solved! Well played.
        {!strict && (
          <button onClick={onRetry} className="ml-2 flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-ink-100 hover:bg-white/15">
            <RotateCcw size={12} /> Retry
          </button>
        )}
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-ruby-500/25 bg-ruby-500/10 px-4 py-3 text-sm font-medium text-ruby-400">
        <XCircle size={18} /> Wrong move.
      </div>
    );
  }
  if (status === 'wrong') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-ruby-500/25 bg-ruby-500/10 px-4 py-3 text-sm font-medium text-ruby-400">
        <XCircle size={18} /> Not quite — try again.
      </div>
    );
  }
  if (status === 'opponent-move') {
    return <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-ink-300">Opponent is replying…</div>;
  }
  return <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-ink-300">Find the best move for the side to move.</div>;
}
