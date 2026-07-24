import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, PuzzleIcon, Target, Zap } from 'lucide-react';
import PuzzleBoard from '../components/PuzzleBoard';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { useAsync } from '../hooks/useAsync';
import { getDailyPuzzle } from '../api/lichess';
import { getPuzzleStats, recordPuzzleResult } from '../lib/puzzleHistory';

export default function Puzzle() {
  const { data, loading, error } = useAsync(() => getDailyPuzzle(), []);
  const [stats, setStats] = useState(() => getPuzzleStats());

  function handleSolved() {
    if (!data) return;
    recordPuzzleResult({ id: data.puzzle.id, rating: data.puzzle.rating, solved: true });
    setStats(getPuzzleStats());
  }

  if (loading) return <LoadingBlock label="Fetching today's puzzle…" />;
  if (error || !data) return <ErrorBlock message="Couldn't load the daily puzzle." />;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <PuzzleIcon className="text-gold-400" /> Daily puzzle
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Rating {data.puzzle.rating} · {data.puzzle.themes.slice(0, 3).join(', ')}
        </p>
      </div>

      <PuzzleBoard puzzle={data} onSolved={handleSolved} />

      <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-ink-850/50 px-4 py-3 text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-ink-300">
            <Target size={14} className="text-gold-400" /> {stats.totalSolved} solved
          </span>
          <span className="flex items-center gap-1.5 text-ink-300">
            <Flame size={14} className="text-gold-400" /> Best streak {stats.bestStreak}
          </span>
        </div>
        <Link to="/puzzle/streak" className="flex items-center gap-1.5 font-semibold text-gold-400 hover:text-gold-300">
          <Zap size={14} /> Streak mode
        </Link>
      </div>
    </div>
  );
}
