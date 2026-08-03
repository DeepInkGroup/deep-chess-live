import { winPercent } from '../hooks/useGameAccuracy';

const WIDTH = 600;
const HEIGHT = 90;

export default function WinProbabilityChart({ evalHistory }: { evalHistory: number[] }) {
  if (evalHistory.length < 2) return null;

  const points = evalHistory.map((cp, i) => {
    const x = (i / (evalHistory.length - 1)) * WIDTH;
    const y = HEIGHT - (winPercent(cp) / 100) * HEIGHT;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M0,${HEIGHT} L${points.join(' L')} L${WIDTH},${HEIGHT} Z`;
  const linePath = `M${points.join(' L')}`;

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Win probability</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-20 w-full">
        <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="currentColor" className="text-white/10" strokeWidth="1" />
        <path d={areaPath} fill="var(--color-ink-100)" opacity="0.12" />
        <path d={linePath} fill="none" stroke="var(--color-ink-100)" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-ink-500">
        <span>White winning</span>
        <span>Black winning</span>
      </div>
    </div>
  );
}
