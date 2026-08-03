import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Archive, ArrowLeft } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getUserGames } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import LichessGameRow, { gameResult } from '../components/LichessGameRow';

const SPEEDS = ['all', 'bullet', 'blitz', 'rapid', 'classical', 'correspondence'];
const RESULTS = ['all', 'win', 'loss', 'draw'] as const;
const RATED = ['all', 'rated', 'casual'];

export default function PlayerGames() {
  const { username = '' } = useParams<{ username: string }>();
  const { data: games, loading, error } = useAsync(() => getUserGames(username, 200), [username]);

  const [opponent, setOpponent] = useState('');
  const [opening, setOpening] = useState('');
  const [speed, setSpeed] = useState('all');
  const [result, setResult] = useState<(typeof RESULTS)[number]>('all');
  const [rated, setRated] = useState('all');

  const filtered = useMemo(() => {
    if (!games) return [];
    const opponentQuery = opponent.trim().toLowerCase();
    const openingQuery = opening.trim().toLowerCase();
    return games.filter((g) => {
      if (speed !== 'all' && g.speed !== speed) return false;
      if (rated !== 'all' && g.rated !== (rated === 'rated')) return false;
      if (result !== 'all' && gameResult(g, username) !== result) return false;
      if (opponentQuery) {
        const isWhite = g.players.white.user?.id?.toLowerCase() === username.toLowerCase();
        const opp = isWhite ? g.players.black : g.players.white;
        const oppName = (opp.user?.name ?? opp.name ?? '').toLowerCase();
        if (!oppName.includes(opponentQuery)) return false;
      }
      if (openingQuery && !(g.opening?.name ?? '').toLowerCase().includes(openingQuery)) return false;
      return true;
    });
  }, [games, opponent, opening, speed, result, rated, username]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={`/players/${username}`} className="mb-2 flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100">
          <ArrowLeft size={14} /> Back to {username}
        </Link>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Archive className="text-gold-400" /> Game Archive
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          {games ? `${filtered.length} of ${games.length} recent Lichess games` : 'Loading games…'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="Opponent name…"
          className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        />
        <input
          value={opening}
          onChange={(e) => setOpening(e.target.value)}
          placeholder="Opening name…"
          className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        />
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s} className="bg-ink-900 capitalize">
              {s === 'all' ? 'All speeds' : s}
            </option>
          ))}
        </select>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value as (typeof RESULTS)[number])}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          {RESULTS.map((r) => (
            <option key={r} value={r} className="bg-ink-900 capitalize">
              {r === 'all' ? 'All results' : r === 'win' ? 'Wins' : r === 'loss' ? 'Losses' : 'Draws'}
            </option>
          ))}
        </select>
        <select
          value={rated}
          onChange={(e) => setRated(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          {RATED.map((r) => (
            <option key={r} value={r} className="bg-ink-900 capitalize">
              {r === 'all' ? 'Rated & casual' : r}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingBlock label="Loading game archive…" />}
      {error && <ErrorBlock message="Couldn't load this player's games." />}

      {games && filtered.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">No games match these filters.</p>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map((g) => (
            <LichessGameRow key={g.id} game={g} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}
