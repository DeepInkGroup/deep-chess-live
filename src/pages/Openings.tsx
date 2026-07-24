import { useState } from 'react';
import { Chess } from 'chess.js';
import { BookOpen, FlipVertical2, RotateCcw } from 'lucide-react';
import BoardPanel from '../components/BoardPanel';
import BookMoves from '../components/BookMoves';
import OpeningSearch from '../components/OpeningSearch';
import { useAsync } from '../hooks/useAsync';
import { getOpeningExplorer } from '../api/explorer';
import { movesFromSan, START_FEN } from '../lib/chess';
import type { MoveStep } from '../lib/chess';
import type { OpeningDbEntry } from '../lib/openingsDb';

export default function Openings() {
  const [moves, setMoves] = useState<MoveStep[]>([]);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const fen = moves.length ? moves[moves.length - 1].fen : START_FEN;
  const book = useAsync(() => getOpeningExplorer(fen), [fen]);

  function applyMove(from: string, to: string, promotion = 'q'): boolean {
    const chess = new Chess();
    chess.load(fen);
    let move;
    try {
      move = chess.move({ from, to, promotion });
    } catch {
      return false;
    }
    if (!move) return false;
    setMoves([...moves, { fen: chess.fen(), san: move.san, moveNumber: Math.floor(moves.length / 2) + 1, color: move.color }]);
    return true;
  }

  function playUci(uci: string) {
    applyMove(uci.slice(0, 2), uci.slice(2, 4), uci.slice(4, 5) || 'q');
  }

  function handleDrop(from: string, to: string): boolean {
    setSelected(undefined);
    return applyMove(from, to);
  }

  function handleSquareClick(square: string) {
    const chess = new Chess();
    chess.load(fen);
    const piece = chess.get(square as Parameters<Chess['get']>[0]);
    const turn = chess.turn();

    if (!selected) {
      if (piece && piece.color === turn) setSelected(square);
      return;
    }
    if (selected === square) {
      setSelected(undefined);
      return;
    }
    if (piece && piece.color === turn) {
      setSelected(square);
      return;
    }
    applyMove(selected, square);
    setSelected(undefined);
  }

  function reset() {
    setMoves([]);
    setSelected(undefined);
  }

  function jumpTo(index: number) {
    setMoves(moves.slice(0, index + 1));
    setSelected(undefined);
  }

  function selectFromDb(entry: OpeningDbEntry) {
    setMoves(movesFromSan(entry.moves));
    setSelected(undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100 sm:text-2xl">
            <BookOpen className="text-gold-400" /> Openings Explorer
          </h1>
          <p className="mt-1 text-sm text-ink-400">Search 3,000+ named openings, or browse real Lichess games move by move to learn theory.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            onClick={() => setOrientation((v) => (v === 'white' ? 'black' : 'white'))}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <FlipVertical2 size={15} /> Flip
          </button>
        </div>
      </div>

      {moves.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/8 bg-ink-850/50 px-3 py-2 text-sm">
          <button onClick={reset} className="text-ink-400 hover:text-gold-400">
            Start
          </button>
          {moves.map((m, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-ink-600">/</span>
              <button onClick={() => jumpTo(i)} className={i === moves.length - 1 ? 'font-semibold text-gold-300' : 'text-ink-300 hover:text-gold-400'}>
                {m.color === 'w' ? `${m.moveNumber}.` : ''}
                {m.san}
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <BoardPanel
          fen={fen}
          orientation={orientation}
          interactive
          onDrop={handleDrop}
          selectedSquare={selected}
          onSquareClick={handleSquareClick}
        />
        <div className="flex w-full max-w-sm flex-col gap-4">
          <OpeningSearch onSelect={selectFromDb} />
          <BookMoves data={book.data} loading={book.loading} onPlay={playUci} minGames={0} />
          {!book.loading && book.data && book.data.moves.length === 0 && (
            <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-4 text-center text-sm text-ink-400">
              Out of book — no more common continuations from here.
            </p>
          )}
          {!book.loading && book.error && (
            <p className="px-2 text-center text-xs text-ink-500">Live game statistics aren't reachable right now — try again shortly.</p>
          )}
        </div>
      </div>
    </div>
  );
}
