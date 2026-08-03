import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Trophy, Users } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getTeam, getTeamArena, getTeamMembers } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { timeAgo } from '../lib/chess';

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>`]/g, '')
    .trim();
}

export default function TeamDetail() {
  const { teamId = '' } = useParams<{ teamId: string }>();
  const teamState = useAsync(() => getTeam(teamId), [teamId]);
  const membersState = useAsync(() => getTeamMembers(teamId, 30), [teamId]);
  const arenaState = useAsync(() => getTeamArena(teamId, 10), [teamId]);

  if (teamState.loading) return <LoadingBlock label="Loading team…" />;
  if (teamState.error || !teamState.data) return <ErrorBlock message="Couldn't load this team." />;

  const team = teamState.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">{team.name}</h1>
            <p className="mt-1 text-sm text-ink-400">
              {team.nbMembers.toLocaleString()} members · Led by {team.leader.name}
            </p>
          </div>
          <a
            href={`https://lichess.org/team/${team.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            View on Lichess <ExternalLink size={14} />
          </a>
        </div>
        {team.description && <p className="mt-4 whitespace-pre-line text-sm text-ink-300">{stripMarkdown(team.description).slice(0, 600)}</p>}
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          <Trophy size={16} className="text-gold-400" /> Recent activity
        </h2>
        {arenaState.loading && <LoadingBlock label="Loading recent tournaments…" />}
        {arenaState.data && arenaState.data.length === 0 && (
          <p className="rounded-xl border border-white/8 bg-ink-850/50 p-4 text-sm text-ink-400">No recent tournaments from this team.</p>
        )}
        {arenaState.data && arenaState.data.length > 0 && (
          <div className="flex flex-col gap-2">
            {arenaState.data.map((t) => (
              <a
                key={t.id}
                href={`https://lichess.org/tournament/${t.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-ink-850/50 px-4 py-3 text-sm transition-colors hover:border-gold-500/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-ink-100">{t.fullName}</p>
                  <p className="text-xs text-ink-500">
                    {t.nbPlayers} players{t.winner ? ` · won by ${t.winner.name}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-ink-500">{timeAgo(t.finishesAt ?? t.startsAt)}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
          <Users size={16} className="text-gold-400" /> Members
        </h2>
        {membersState.loading && <LoadingBlock label="Loading members…" />}
        {membersState.error && <ErrorBlock message="Couldn't load members." />}
        {membersState.data && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {membersState.data.map((m) => (
              <Link
                key={m.id}
                to={`/players/${m.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-ink-850/50 px-3 py-2 text-sm text-ink-200 hover:border-gold-500/30 hover:text-gold-400"
              >
                {m.title && <span className="text-gold-400">{m.title}</span>}
                <span className="truncate">{m.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
