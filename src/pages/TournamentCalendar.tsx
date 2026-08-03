import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getTournaments } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { formatClockControl } from '../lib/chess';

export default function TournamentCalendar() {
  const { data, loading, error } = useAsync(() => getTournaments(), []);

  const byHour = useMemo(() => {
    const upcoming = (data ? [...data.started, ...data.created] : []).sort((a, b) => a.startsAt - b.startsAt);
    const map = new Map<string, typeof upcoming>();
    upcoming.forEach((t) => {
      const key = new Date(t.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [data]);

  if (loading) return <LoadingBlock label="Loading schedule…" />;
  if (error || !data) return <ErrorBlock message="Couldn't load tournaments." />;

  const hours = Array.from(byHour.keys());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <CalendarDays className="text-gold-400" /> Today's Schedule
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Lichess only publishes tournament start times a few hours ahead, so this shows what's live or starting soon rather than a full calendar.
        </p>
      </div>

      {hours.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">Nothing scheduled right now.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {hours.map((hour) => (
            <div key={hour}>
              <h2 className="mb-2 text-sm font-semibold text-ink-400">{hour}</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {byHour.get(hour)!.map((t) => {
                  const isLive = data.started.some((s) => s.id === t.id);
                  return (
                    <Link
                      key={t.id}
                      to={`/tournaments/${t.id}`}
                      className="flex flex-col gap-1 rounded-xl border border-white/8 bg-ink-850/60 p-3 text-left transition-colors hover:border-gold-500/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-ink-100">{t.fullName}</p>
                        {isLive ? (
                          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-ink-500">
                            {new Date(t.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-2 text-xs text-ink-500">
                        <span>{formatClockControl(t.clock.limit, t.clock.increment)}</span>
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {t.nbPlayers}
                        </span>
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
