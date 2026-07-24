import { Link } from 'react-router-dom';
import { Swords, Users } from 'lucide-react';
import type { LichessTournament } from '../types/lichess';
import { formatClockControl, timeUntil } from '../lib/chess';

const VARIANT_ICONS: Record<string, string> = {
  bullet: '🚀',
  blitz: '⚡',
  rapid: '🕐',
  classical: '♟️',
  ultraBullet: '💨',
  chess960: '🎲',
  crazyhouse: '🏠',
  antichess: '🙃',
  atomic: '💥',
  horde: '🐝',
  kingOfTheHill: '⛰️',
  threeCheck: '3️⃣',
  racingKings: '🏁',
};

export default function TournamentCard({ tournament }: { tournament: LichessTournament }) {
  const isLive = tournament.status === 20;
  const isFinished = tournament.status === 30;

  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-ink-850/60 p-4 transition-all hover:border-gold-500/30 hover:bg-ink-850"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-ink-100">
          <span className="mr-1.5">{VARIANT_ICONS[tournament.perf.key] ?? '♟️'}</span>
          {tournament.fullName}
        </p>
        {isLive && (
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live
          </span>
        )}
        {!isLive && !isFinished && (
          <span className="shrink-0 rounded-md bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-400">
            in {timeUntil(tournament.startsAt)}
          </span>
        )}
        {isFinished && (
          <span className="shrink-0 rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">Finished</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
        <span>{formatClockControl(tournament.clock.limit, tournament.clock.increment)}</span>
        <span>·</span>
        <span className="capitalize">{tournament.perf.name}</span>
        <span>·</span>
        <span>{tournament.rated ? 'Rated' : 'Casual'}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Users size={11} /> {tournament.nbPlayers}
        </span>
      </div>

      {tournament.winner && (
        <p className="flex items-center gap-1.5 text-xs text-gold-400">
          <Swords size={12} /> Winner: {tournament.winner.title && `${tournament.winner.title} `}
          {tournament.winner.name}
        </p>
      )}
    </Link>
  );
}
