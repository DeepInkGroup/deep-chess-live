import { BookOpen } from 'lucide-react';
import type { OpeningExplorerResponse } from '../types/explorer';

interface BookMovesProps {
  data: OpeningExplorerResponse | null;
  loading: boolean;
  onPlay?: (uci: string) => void;
  minGames?: number;
  title?: string;
}

export default function BookMoves({ data, loading, onPlay, minGames = 10, title }: BookMovesProps) {
  const totalGames = data ? data.white + data.draws + data.black : 0;

  if (!loading && (!data || data.moves.length === 0 || totalGames < minGames)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
          <BookOpen size={13} /> {title ?? data?.opening?.name ?? 'Opening book'}
        </h2>
        {data && <span className="text-[11px] text-ink-500">{formatCount(totalGames)} games</span>}
      </div>

      {data && totalGames > 0 && (
        <div className="mb-3 px-1">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
            <div style={{ width: `${(data.white / totalGames) * 100}%` }} className="bg-ink-100" />
            <div style={{ width: `${(data.draws / totalGames) * 100}%` }} className="bg-ink-500" />
            <div style={{ width: `${(data.black / totalGames) * 100}%` }} className="bg-ink-900" />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-ink-500">
            <span>White {((data.white / totalGames) * 100).toFixed(0)}%</span>
            <span>Draw {((data.draws / totalGames) * 100).toFixed(0)}%</span>
            <span>Black {((data.black / totalGames) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {loading && !data && <p className="px-1 py-2 text-sm text-ink-500">Looking up theory…</p>}

      {data && (
        <div className="flex flex-col gap-1.5">
          {data.moves.slice(0, 6).map((m) => {
            const total = m.white + m.draws + m.black;
            const whitePct = total ? (m.white / total) * 100 : 0;
            const drawPct = total ? (m.draws / total) * 100 : 0;
            const blackPct = total ? (m.black / total) * 100 : 0;
            return (
              <button
                key={m.uci}
                onClick={() => onPlay?.(m.uci)}
                className="flex items-center gap-2 rounded-lg px-1 py-1 text-left text-sm transition-colors hover:bg-white/5"
              >
                <span className="w-12 shrink-0 font-medium text-ink-100">{m.san}</span>
                <div className="flex h-4 flex-1 overflow-hidden rounded-md bg-white/5">
                  <div style={{ width: `${whitePct}%` }} className="bg-ink-100" />
                  <div style={{ width: `${drawPct}%` }} className="bg-ink-500" />
                  <div style={{ width: `${blackPct}%` }} className="bg-ink-900" />
                </div>
                <span className="w-14 shrink-0 text-right text-[11px] text-ink-500">{formatCount(total)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}
