import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, LayoutDashboard, Palette, Star, Target, Trash2, Trophy } from 'lucide-react';
import { getPuzzleStats, getRecentPuzzles } from '../lib/puzzleHistory';
import { getFavorites, removeFavorite } from '../lib/favorites';
import { timeAgo, START_FEN } from '../lib/chess';
import { BOARD_PALETTES } from '../lib/boardTheme';
import { PIECE_SETS } from '../lib/pieceSets';
import { useBoardTheme } from '../contexts/BoardThemeContext';
import BoardPanel from '../components/BoardPanel';
import type { FavoritePlayer } from '../lib/favorites';

export default function Dashboard() {
  const [stats, setStats] = useState(() => getPuzzleStats());
  const [recent] = useState(() => getRecentPuzzles(8));
  const [favorites, setFavorites] = useState<FavoritePlayer[]>([]);
  const { paletteId, setPaletteId, pieceSetId, setPieceSetId } = useBoardTheme();

  useEffect(() => {
    setFavorites(getFavorites());
    setStats(getPuzzleStats());
  }, []);

  function unfavorite(username: string) {
    removeFavorite(username);
    setFavorites(getFavorites());
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <LayoutDashboard className="text-gold-400" /> Your Dashboard
        </h1>
        <p className="mt-1 text-sm text-ink-400">Puzzle progress and favorite players, stored locally in this browser.</p>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          <Trophy size={16} className="text-gold-400" /> Puzzle stats
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard icon={<Target size={16} className="text-gold-400" />} label="Solved" value={stats.totalSolved} />
          <StatCard icon={<Flame size={16} className="text-gold-400" />} label="Best streak" value={stats.bestStreak} />
          <StatCard
            icon={<Trophy size={16} className="text-gold-400" />}
            label="Success rate"
            value={stats.totalAttempted ? `${Math.round((stats.totalSolved / stats.totalAttempted) * 100)}%` : '—'}
          />
        </div>
        {recent.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-white/8 bg-ink-850/60 p-3">
            {recent.map((p, i) => (
              <div key={`${p.id}-${i}`} className="flex items-center justify-between px-1 py-1 text-sm">
                <span className={p.solved ? 'text-emerald-400' : 'text-ruby-400'}>{p.solved ? 'Solved' : 'Missed'}</span>
                <span className="text-ink-400">Rating {p.rating}</span>
                <span className="text-xs text-ink-500">{timeAgo(p.date)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <Link to="/puzzle" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            Daily puzzle
          </Link>
          <Link to="/puzzle/streak" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            Streak mode
          </Link>
          <Link to="/puzzle/rush" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
            Timed rush
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          <Star size={16} className="text-gold-400" /> Favorite players
        </h2>
        {favorites.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
            No favorites yet. Star a player from their profile to see them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <div key={f.username} className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-ink-850/60 px-4 py-3">
                <Link to={`/players/${f.username}`} className="flex min-w-0 items-center gap-1.5 text-sm text-ink-100 hover:text-gold-400">
                  {f.title && <span className="text-gold-400">{f.title}</span>}
                  <span className="truncate">{f.username}</span>
                </Link>
                <button onClick={() => unfavorite(f.username)} aria-label="Remove favorite" className="shrink-0 text-ink-500 hover:text-ruby-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          <Palette size={16} className="text-gold-400" /> Board theme
        </h2>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-ink-850/60 p-4 sm:flex-row sm:items-start">
          <BoardPanel fen={START_FEN} size={160} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {BOARD_PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPaletteId(p.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  paletteId === p.id ? 'border-gold-500/40 bg-gold-500/10 text-gold-300' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
                }`}
              >
                <span className="flex h-4 w-4 overflow-hidden rounded-sm border border-white/20">
                  <span className="h-full w-1/2" style={{ backgroundColor: p.light }} />
                  <span className="h-full w-1/2" style={{ backgroundColor: p.dark }} />
                </span>
                {p.name}
                {paletteId === p.id && <Check size={13} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PIECE_SETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setPieceSetId(s.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                pieceSetId === s.id ? 'border-gold-500/40 bg-gold-500/10 text-gold-300' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
              }`}
            >
              {s.label}
              {pieceSetId === s.id && <Check size={13} />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-850/60 p-3">
      {icon}
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="font-display text-lg font-semibold text-ink-100">{value}</p>
      </div>
    </div>
  );
}
