import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import * as lichess from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { timeAgo } from '../lib/chess';

const PERFS = ['bullet', 'blitz', 'rapid', 'classical'];

async function loadCompare(userA: string, userB: string) {
  const [a, b, games] = await Promise.all([
    lichess.getUser(userA),
    lichess.getUser(userB),
    lichess.getUserGames(userA, 30, userB).catch(() => []),
  ]);
  return { a, b, games };
}

export default function HeadToHead() {
  const { userA = '', userB = '' } = useParams<{ userA: string; userB: string }>();
  const navigate = useNavigate();

  if (!userA || !userB) return <CompareForm />;

  return <CompareResult userA={userA} userB={userB} onNewCompare={() => navigate('/compare')} />;
}

function CompareForm() {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameA.trim() || !nameB.trim()) return;
    navigate(`/compare/${encodeURIComponent(nameA.trim())}/${encodeURIComponent(nameB.trim())}`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Swords className="text-gold-400" /> Head-to-Head
        </h1>
        <p className="mt-1 text-sm text-ink-400">Compare two Lichess players' ratings and their games against each other.</p>
      </div>
      <form onSubmit={submit} className="flex w-full flex-col items-center gap-3 sm:flex-row">
        <input
          value={nameA}
          onChange={(e) => setNameA(e.target.value)}
          placeholder="Player one"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        />
        <span className="text-ink-500">vs</span>
        <input
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          placeholder="Player two"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-gold-400">
          Compare
        </button>
      </form>
    </div>
  );
}

function CompareResult({ userA, userB, onNewCompare }: { userA: string; userB: string; onNewCompare: () => void }) {
  const { data, loading, error } = useAsync(() => loadCompare(userA, userB), [userA, userB]);

  if (loading) return <LoadingBlock label={`Comparing ${userA} and ${userB}…`} />;
  if (error || !data) return <ErrorBlock message="Couldn't load one or both players." />;

  const { a, b, games } = data;
  let winsA = 0;
  let winsB = 0;
  let draws = 0;
  games.forEach((g) => {
    const aIsWhite = g.players.white.user?.id?.toLowerCase() === a.id.toLowerCase();
    if (!g.winner) draws++;
    else if ((g.winner === 'white') === aIsWhite) winsA++;
    else winsB++;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100 sm:text-2xl">
          <Swords className="text-gold-400" /> {a.username} vs {b.username}
        </h1>
        <button onClick={onNewCompare} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10">
          New comparison
        </button>
      </div>

      {(a.disabled || b.disabled) && (
        <p className="rounded-xl border border-ruby-500/20 bg-ruby-500/5 px-4 py-2 text-sm text-ruby-400">
          {a.disabled && b.disabled ? `${a.username} and ${b.username} are` : a.disabled ? `${a.username} is` : `${b.username} is`} a closed account —
          ratings and stats aren't available.
        </p>
      )}

      {games.length > 0 && (
        <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/8 bg-ink-850/60 p-6">
          <ScoreBlock label={a.username} value={winsA} />
          <span className="text-ink-500">—</span>
          <ScoreBlock label="Draws" value={draws} />
          <span className="text-ink-500">—</span>
          <ScoreBlock label={b.username} value={winsB} />
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Ratings</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">Perf</th>
                <th className="px-4 py-2 text-right font-medium">{a.username}</th>
                <th className="px-4 py-2 text-right font-medium">{b.username}</th>
              </tr>
            </thead>
            <tbody>
              {PERFS.map((perf) => {
                const pa = a.perfs?.[perf];
                const pb = b.perfs?.[perf];
                if (!pa && !pb) return null;
                return (
                  <tr key={perf} className="border-t border-white/5 text-ink-200">
                    <td className="px-4 py-2 capitalize text-ink-400">{perf}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${pa && pb && pa.rating > pb.rating ? 'text-gold-400' : 'text-ink-100'}`}>
                      {pa?.rating ?? '—'}
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${pa && pb && pb.rating > pa.rating ? 'text-gold-400' : 'text-ink-100'}`}>
                      {pb?.rating ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-400">Recent games between them</h2>
        {games.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
            No games found between these two players.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {games.map((g) => {
              const aIsWhite = g.players.white.user?.id?.toLowerCase() === a.id.toLowerCase();
              const result = !g.winner ? 'Draw' : (g.winner === 'white') === aIsWhite ? `${a.username} won` : `${b.username} won`;
              return (
                <div key={g.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-850/50 px-4 py-3 text-sm">
                  <span className="text-ink-200">{result}</span>
                  <span className="text-xs text-ink-500">
                    {g.speed} · {timeAgo(g.lastMoveAt ?? g.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ScoreBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-semibold text-ink-100">{value}</p>
      <p className="mt-1 truncate text-xs text-ink-400">{label}</p>
    </div>
  );
}
