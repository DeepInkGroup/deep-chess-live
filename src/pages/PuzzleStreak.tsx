import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, RotateCcw, Trophy, Zap } from 'lucide-react';
import PuzzleBoard from '../components/PuzzleBoard';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { getNextPuzzle } from '../api/lichess';
import { getBestStreak, recordPuzzleResult, recordStreak } from '../lib/puzzleHistory';
import type { LichessPuzzle } from '../types/lichess';

export default function PuzzleStreak() {
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => getBestStreak());
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNext() {
    setLoading(true);
    setError(null);
    try {
      const next = await getNextPuzzle();
      setPuzzle(next);
    } catch {
      setError("Couldn't load a puzzle. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSolved() {
    if (!puzzle) return;
    recordPuzzleResult({ id: puzzle.puzzle.id, rating: puzzle.puzzle.rating, solved: true });
    setStreak((s) => s + 1);
    setTimeout(loadNext, 400);
  }

  function handleFailed() {
    if (!puzzle) return;
    recordPuzzleResult({ id: puzzle.puzzle.id, rating: puzzle.puzzle.rating, solved: false });
    recordStreak(streak);
    setBestStreak(getBestStreak());
    setEnded(true);
  }

  function playAgain() {
    setStreak(0);
    setEnded(false);
    loadNext();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Zap className="text-gold-400" /> Puzzle Streak
        </h1>
        <p className="mt-1 text-sm text-ink-400">Solve as many puzzles in a row as you can. One wrong move ends the run.</p>
      </div>

      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 font-display text-2xl font-semibold text-ink-100">
          <Flame className="text-gold-400" size={22} /> {streak}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-ink-400">
          <Trophy size={14} className="text-gold-400" /> Best {bestStreak}
        </span>
      </div>

      {loading && <LoadingBlock label="Loading puzzle…" />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && puzzle && !ended && (
        <PuzzleBoard key={puzzle.puzzle.id} puzzle={puzzle} strict onSolved={handleSolved} onFailed={handleFailed} />
      )}

      {ended && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-ink-850/60 p-8">
          <p className="font-display text-3xl font-semibold text-ink-100">{streak}</p>
          <p className="text-sm text-ink-400">{streak > 0 ? 'puzzles solved in a row' : 'No puzzles solved this run'}</p>
          {streak >= bestStreak && streak > 0 && <p className="text-sm font-semibold text-gold-400">New best streak!</p>}
          <div className="flex gap-2">
            <button
              onClick={playAgain}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow-gold"
            >
              <RotateCcw size={15} /> Play again
            </button>
            <Link to="/puzzle" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink-200 hover:bg-white/10">
              Daily puzzle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
