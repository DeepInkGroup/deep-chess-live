import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import type { LichessBroadcastListItem } from '../types/lichess';

export default function BroadcastCard({ item, live }: { item: LichessBroadcastListItem; live?: boolean }) {
  const { tour, round } = item;
  return (
    <Link
      to={`/broadcasts/${tour.id}`}
      state={{ roundId: round.id }}
      className="flex gap-3 overflow-hidden rounded-2xl border border-white/8 bg-ink-850/60 transition-all hover:border-gold-500/30 hover:bg-ink-850"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden bg-ink-700">
        {tour.image ? (
          <img src={tour.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-500">
            <Radio size={20} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 py-2 pr-3">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink-100">{tour.name}</p>
          {live && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-400">{round.name}</p>
        {tour.info?.location && <p className="truncate text-[11px] text-ink-500">{tour.info.location}</p>}
      </div>
    </Link>
  );
}
