import { useParams } from 'react-router-dom';
import { ExternalLink, Medal, Trophy, Users } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getTournament } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { formatClockControl } from '../lib/chess';

const MEDAL_COLORS = ['text-gold-400', 'text-ink-200', 'text-[#c98a4b]'];

export default function TournamentDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, error } = useAsync(() => getTournament(id), [id]);

  if (loading) return <LoadingBlock label="Loading tournament…" />;
  if (error || !data) return <ErrorBlock message="Couldn't load this tournament." />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/8 bg-ink-850/60 p-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">{data.fullName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
            <span>{formatClockControl(data.clock.limit, data.clock.increment)}</span>
            <span>·</span>
            <span className="capitalize">{data.perf.name}</span>
            <span>·</span>
            <span>{data.rated ? 'Rated' : 'Casual'}</span>
            <span>·</span>
            <span>{data.minutes} min</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {data.nbPlayers} players
            </span>
          </div>
        </div>
        <a
          href={`https://lichess.org/tournament/${data.id}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow-gold transition-transform hover:scale-[1.03]"
        >
          Join on Lichess <ExternalLink size={14} />
        </a>
      </div>

      {data.podium && data.podium.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
            <Trophy size={16} className="text-gold-400" /> Podium
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.podium.map((p) => (
              <div key={p.rank} className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink-850/60 p-4">
                <Medal size={22} className={MEDAL_COLORS[p.rank - 1] ?? 'text-ink-400'} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-100">
                    {p.title && <span className="mr-1 text-gold-400">{p.title}</span>}
                    {p.name}
                  </p>
                  <p className="text-xs text-ink-500">
                    {p.score} pts · {p.rating}
                    {p.performance ? ` · perf ${p.performance}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Standings</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Player</th>
                <th className="px-4 py-2 font-medium">Rating</th>
                <th className="px-4 py-2 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.standing.players.map((p) => (
                <tr key={p.rank} className="border-t border-white/5 text-ink-200">
                  <td className="px-4 py-2 text-ink-500">{p.rank}</td>
                  <td className="px-4 py-2">
                    {p.title && <span className="mr-1 text-gold-400">{p.title}</span>}
                    {p.name}
                    {p.sheet?.fire && <span className="ml-1">🔥</span>}
                  </td>
                  <td className="px-4 py-2 text-ink-400">{p.rating}</td>
                  <td className="px-4 py-2 text-right font-semibold text-ink-100">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {data.stats && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Stats</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Games" value={data.stats.games} />
            <Stat label="White wins" value={data.stats.whiteWins} />
            <Stat label="Black wins" value={data.stats.blackWins} />
            <Stat label="Draws" value={data.stats.draws} />
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-850/60 p-3">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="font-display text-lg font-semibold text-ink-100">{value}</p>
    </div>
  );
}
