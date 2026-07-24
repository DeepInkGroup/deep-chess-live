import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { useAsync, usePolling } from '../hooks/useAsync';
import { getBroadcastRound, getBroadcastTour } from '../api/lichess';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import BroadcastGameCard from '../components/BroadcastGameCard';

interface LocationState {
  roundId?: string;
}

export default function BroadcastTour() {
  const { tourId = '' } = useParams<{ tourId: string }>();
  const location = useLocation();
  const initialRoundId = (location.state as LocationState | null)?.roundId;

  const tourState = useAsync(() => getBroadcastTour(tourId), [tourId]);
  const [roundId, setRoundId] = useState<string | undefined>(initialRoundId);

  useEffect(() => {
    if (roundId || !tourState.data) return;
    const rounds = tourState.data.rounds;
    const now = Date.now();
    const started = rounds.filter((r) => r.startsAt !== undefined && r.startsAt <= now);
    setRoundId((started.length > 0 ? started[started.length - 1] : rounds[rounds.length - 1])?.id);
  }, [tourState.data, roundId]);

  const roundState = usePolling(() => (roundId ? getBroadcastRound(roundId) : Promise.resolve(null)), 6000, [roundId]);

  if (tourState.loading) return <LoadingBlock label="Loading broadcast…" />;
  if (tourState.error || !tourState.data) return <ErrorBlock message="Couldn't load this broadcast." />;

  const { tour, rounds } = tourState.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">{tour.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
              {tour.info?.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {tour.info.location}
                </span>
              )}
              {tour.dates && tour.dates[0] && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {new Date(tour.dates[0]).toLocaleDateString()}
                </span>
              )}
              {tour.info?.tc && <span>{tour.info.tc}</span>}
            </div>
          </div>
          <a
            href={tour.url}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-ink-100 hover:bg-white/10"
          >
            View on Lichess <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {rounds.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoundId(r.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              roundId === r.id ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {roundState.loading && <LoadingBlock label="Loading round…" />}
      {roundState.error && <ErrorBlock message="Couldn't load this round." />}
      {roundState.data && roundState.data.games.length === 0 && (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">
          No games broadcast yet for this round. Check back once it starts.
        </p>
      )}
      {roundState.data && roundState.data.games.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roundState.data.games.map((g) => (
            <BroadcastGameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
