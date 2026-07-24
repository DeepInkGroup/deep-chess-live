import { formatClock } from '../lib/chess';

interface PlayerBadgeProps {
  name: string;
  title?: string | null;
  rating?: number;
  clockSeconds?: number;
  active?: boolean;
  color: 'white' | 'black';
}

export default function PlayerBadge({ name, title, rating, clockSeconds, active, color }: PlayerBadgeProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-ink-850/70 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full border border-white/20 ${color === 'white' ? 'bg-ink-100' : 'bg-ink-900'}`} />
        <span className="truncate text-sm font-medium text-ink-100">
          {title && <span className="mr-1 text-gold-400">{title}</span>}
          {name}
        </span>
        {rating !== undefined && <span className="shrink-0 text-xs text-ink-400">({rating})</span>}
      </div>
      {clockSeconds !== undefined && (
        <span
          className={`shrink-0 rounded-md px-2 py-1 font-mono text-sm tabular-nums ${
            active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-ink-300'
          }`}
        >
          {formatClock(clockSeconds)}
        </span>
      )}
    </div>
  );
}
