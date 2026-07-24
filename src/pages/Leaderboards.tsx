import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, Crown } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getLeaderboard } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';

const PERFS = [
  { key: 'bullet', label: 'Bullet' },
  { key: 'blitz', label: 'Blitz' },
  { key: 'rapid', label: 'Rapid' },
  { key: 'classical', label: 'Classical' },
  { key: 'chess960', label: 'Chess960' },
  { key: 'crazyhouse', label: 'Crazyhouse' },
];

const MEDAL_COLORS = ['text-gold-400', 'text-ink-200', 'text-[#c98a4b]'];

export default function Leaderboards() {
  const [perf, setPerf] = useState('bullet');
  const { data, loading, error } = useAsync(() => getLeaderboard(perf, 25), [perf]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Crown className="text-gold-400" /> Leaderboards
        </h1>
        <p className="mt-1 text-sm text-ink-400">The highest-rated Lichess players, by time control.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERFS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPerf(p.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              perf === p.key ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock label="Fetching leaderboard…" />}
      {error && <ErrorBlock message="Couldn't load the leaderboard." />}

      {data && (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Player</th>
                <th className="px-4 py-2 text-right font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u, i) => (
                <tr key={u.id} className="border-t border-white/5 text-ink-200">
                  <td className="px-4 py-2 text-ink-500">
                    {i < 3 ? <span className={`font-semibold ${MEDAL_COLORS[i]}`}>{i + 1}</span> : i + 1}
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/players/${u.username}`} className="flex items-center gap-1.5 hover:text-gold-400">
                      {u.title && <span className="text-gold-400">{u.title}</span>}
                      {u.username}
                      {u.online && <Circle size={7} className="fill-current text-emerald-400" />}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-ink-100">{u.perfs[perf]?.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
