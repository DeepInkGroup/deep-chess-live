import { Cpu } from 'lucide-react';
import type { EngineLine } from '../hooks/useStockfish';
import { formatEval, pvToSan, scoreToWhitePerspective } from '../lib/chess';

interface EngineLinesProps {
  fen: string;
  lines: EngineLine[];
  thinking: boolean;
  ready: boolean;
}

export default function EngineLines({ fen, lines, thinking, ready }: EngineLinesProps) {
  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const depth = lines[0]?.depth ?? 0;

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
          <Cpu size={13} /> Stockfish
        </h2>
        <span className="text-[11px] text-ink-500">
          {!ready ? 'Loading engine…' : thinking ? `Depth ${depth}…` : depth ? `Depth ${depth}` : ''}
        </span>
      </div>

      {lines.length === 0 && (
        <p className="px-1 py-3 text-sm text-ink-500">{ready ? 'Thinking…' : 'Warming up the engine (first load can take a moment).'}</p>
      )}

      <div className="flex flex-col gap-1.5">
        {lines.map((line) => {
          const persp = scoreToWhitePerspective(sideToMove as 'w' | 'b', line.scoreCp, line.scoreMate);
          const sans = pvToSan(fen, line.pvUci, 8);
          return (
            <div key={line.multipv} className="flex items-start gap-2 rounded-lg px-1 py-1 text-sm">
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                  (persp.cp ?? 0) >= 0 && persp.mate === undefined
                    ? 'bg-ink-100 text-ink-950'
                    : persp.mate !== undefined && persp.mate < 0
                      ? 'bg-ruby-500/80 text-white'
                      : persp.mate !== undefined
                        ? 'bg-ink-100 text-ink-950'
                        : 'bg-ink-700 text-ink-100'
                }`}
              >
                {formatEval(persp.cp, persp.mate)}
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-300">{sans.join(' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
