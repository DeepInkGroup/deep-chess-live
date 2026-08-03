import { formatEval } from '../lib/chess';

interface EvalBarProps {
  cp?: number;
  mate?: number;
  height?: number;
  loading?: boolean;
}

export default function EvalBar({ cp, mate, height = 480, loading = false }: EvalBarProps) {
  const hasEval = cp !== undefined || mate !== undefined;
  const clamped = mate !== undefined ? (mate > 0 ? 1000 : -1000) : Math.max(-1000, Math.min(1000, cp ?? 0));
  const whitePercent = 50 + (clamped / 1000) * 50;
  const label = formatEval(cp, mate);
  const labelForWhite = mate !== undefined ? mate >= 0 : (cp ?? 0) >= 0;

  return (
    <div
      className="relative w-8 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-ink-950 shadow-inner sm:w-9"
      style={{ height }}
    >
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-100 to-ink-200 transition-[height] duration-500 ease-out ${
          loading ? 'opacity-40' : ''
        }`}
        style={{ height: `${whitePercent}%` }}
      />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      {hasEval && !loading && (
        <span
          className={`absolute inset-x-0 px-1 text-center text-[10px] font-semibold tabular-nums ${
            labelForWhite ? 'bottom-1 text-ink-950' : 'top-1 text-ink-100'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
