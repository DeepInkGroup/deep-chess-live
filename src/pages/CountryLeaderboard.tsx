import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getTeamMembers, getUser } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';

const COUNTRIES: { label: string; teamId: string }[] = [
  { label: 'United States', teamId: 'usa' },
  { label: 'India', teamId: 'chessbase-india-official' },
  { label: 'Germany', teamId: 'team-germany' },
  { label: 'England', teamId: 'chess-england' },
  { label: 'Russia', teamId: 'russian-chess-school' },
  { label: 'Italy', teamId: 'scacchierando' },
  { label: 'Brazil', teamId: 'clube-online-xadrez-do-sul' },
  { label: 'Poland', teamId: 'grojecchess' },
  { label: 'Nigeria', teamId: 'nigeria-elite' },
  { label: 'Indonesia', teamId: 'liga-catur-indonesia' },
  { label: 'Spain', teamId: 'spain-online' },
  { label: 'France', teamId: 'france' },
];

const PERFS = ['blitz', 'rapid', 'classical', 'bullet'];

async function loadCountryLeaderboard(teamId: string, perf: string) {
  const members = await getTeamMembers(teamId, 20);
  const users = await Promise.all(members.map((m) => getUser(m.name).catch(() => null)));
  return users
    .filter((u): u is NonNullable<typeof u> => !!u && !!u.perfs?.[perf])
    .map((u) => ({ user: u, rating: u.perfs![perf].rating }))
    .sort((a, b) => b.rating - a.rating);
}

export default function CountryLeaderboard() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [perf, setPerf] = useState('blitz');
  const { data, loading, error } = useAsync(() => loadCountryLeaderboard(country.teamId, perf), [country.teamId, perf]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Globe2 className="text-gold-400" /> Country Leaderboard
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Lichess doesn't publish an official country ranking, so this ranks members of a well-known community team for each country. Treat it as
          a sample, not an authoritative national ranking.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={country.teamId}
          onChange={(e) => setCountry(COUNTRIES.find((c) => c.teamId === e.target.value) ?? COUNTRIES[0])}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          {COUNTRIES.map((c) => (
            <option key={c.teamId} value={c.teamId} className="bg-ink-900">
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={perf}
          onChange={(e) => setPerf(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          {PERFS.map((p) => (
            <option key={p} value={p} className="bg-ink-900 capitalize">
              {p}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingBlock label={`Loading ${country.label} leaderboard…`} />}
      {error && <ErrorBlock message="Couldn't load this leaderboard." />}

      {data && data.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
          No members with a {perf} rating found in this sample.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Player</th>
                <th className="px-4 py-2 text-right font-medium capitalize">{perf}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.user.id} className="border-t border-white/5 text-ink-200">
                  <td className="px-4 py-2 text-ink-500">{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-ink-100">
                    {row.user.title && <span className="mr-1 text-gold-400">{row.user.title}</span>}
                    {row.user.username}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
