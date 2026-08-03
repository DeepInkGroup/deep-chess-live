import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, PuzzleIcon, Shuffle, Target, Zap } from 'lucide-react';
import PuzzleBoard from '../components/PuzzleBoard';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { useAsync } from '../hooks/useAsync';
import { getDailyPuzzle, getNextPuzzle } from '../api/lichess';
import { getDailyPuzzle as getChessComDailyPuzzle } from '../api/chesscom';
import { chessComPuzzleToPuzzleShape } from '../lib/chess';
import { getPuzzleStats, recordPuzzleResult } from '../lib/puzzleHistory';

const THEMES = [
  { key: '', label: 'Daily puzzle' },
  { key: 'fork', label: 'Fork' },
  { key: 'pin', label: 'Pin' },
  { key: 'skewer', label: 'Skewer' },
  { key: 'sacrifice', label: 'Sacrifice' },
  { key: 'mateIn2', label: 'Mate in 2' },
  { key: 'endgame', label: 'Endgame' },
  { key: 'hangingPiece', label: 'Hanging piece' },
  { key: 'deflection', label: 'Deflection' },
];

export default function Puzzle() {
  const [source, setSource] = useState<'lichess' | 'chesscom'>('lichess');
  const [theme, setTheme] = useState('');
  const [nonce, setNonce] = useState(0);
  const lichessPuzzle = useAsync(() => (theme ? getNextPuzzle(theme) : getDailyPuzzle()), [theme, nonce]);
  const chessComPuzzle = useAsync(() => getChessComDailyPuzzle(), []);
  const [stats, setStats] = useState(() => getPuzzleStats());

  const data = source === 'lichess' ? lichessPuzzle.data : chessComPuzzle.data && chessComPuzzleToPuzzleShape(chessComPuzzle.data);
  const loading = source === 'lichess' ? lichessPuzzle.loading : chessComPuzzle.loading;
  const error = source === 'lichess' ? lichessPuzzle.error : chessComPuzzle.error;

  function handleSolved() {
    if (!data) return;
    recordPuzzleResult({ id: data.puzzle.id, rating: data.puzzle.rating, solved: true });
    setStats(getPuzzleStats());
    if (source === 'lichess' && theme) setTimeout(() => setNonce((n) => n + 1), 500);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <PuzzleIcon className="text-gold-400" /> Daily puzzle
        </h1>
        {data && (
          <p className="mt-1 text-sm text-ink-400">
            {source === 'lichess' ? `Rating ${data.puzzle.rating} · ${data.puzzle.themes.slice(0, 3).join(', ')}` : 'Find the mate'}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSource('lichess')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            source === 'lichess' ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
          }`}
        >
          Lichess
        </button>
        <button
          onClick={() => setSource('chesscom')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            source === 'chesscom' ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
          }`}
        >
          Chess.com
        </button>
      </div>

      {source === 'lichess' && (
        <div className="flex items-center gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
          >
            {THEMES.map((t) => (
              <option key={t.key} value={t.key} className="bg-ink-900">
                {t.label}
              </option>
            ))}
          </select>
          {theme && (
            <button
              onClick={() => setNonce((n) => n + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
            >
              <Shuffle size={14} /> New puzzle
            </button>
          )}
        </div>
      )}

      {loading && <LoadingBlock label="Fetching today's puzzle…" />}
      {(error || (!loading && !data)) && <ErrorBlock message="Couldn't load this puzzle." />}
      {data && <PuzzleBoard key={`${source}-${data.puzzle.id}`} puzzle={data} onSolved={handleSolved} />}

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
