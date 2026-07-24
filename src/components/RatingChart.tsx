import { useMemo, useState } from 'react';

interface RatingChartProps {
  points: [number, number, number, number][];
  height?: number;
}

export default function RatingChart({ points, height = 140 }: RatingChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;

  const data = useMemo(
    () =>
      points
        .map(([y, m, d, rating]) => ({ t: new Date(y, m, d).getTime(), rating }))
        .sort((a, b) => a.t - b.t),
    [points],
  );

  if (data.length < 2) {
    return <p className="py-6 text-center text-sm text-ink-500">Not enough history yet.</p>;
  }

  const minT = data[0].t;
  const maxT = data[data.length - 1].t;
  const ratings = data.map((d) => d.rating);
  const minR = Math.min(...ratings);
  const maxR = Math.max(...ratings);
  const padR = Math.max(20, (maxR - minR) * 0.1);
  const lo = minR - padR;
  const hi = maxR + padR;

  const x = (t: number) => (maxT === minT ? 0 : ((t - minT) / (maxT - minT)) * width);
  const y = (r: number) => height - ((r - lo) / (hi - lo)) * height;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.t).toFixed(1)} ${y(d.rating).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${x(maxT).toFixed(1)} ${height} L ${x(minT).toFixed(1)} ${height} Z`;

  const active = hover !== null ? data[hover] : data[data.length - 1];

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between px-1">
        <span className="font-display text-lg font-semibold text-ink-100">{active.rating}</span>
        <span className="text-xs text-ink-500">{new Date(active.t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const t = minT + ratio * (maxT - minT);
          let closest = 0;
          let closestDist = Infinity;
          data.forEach((d, i) => {
            const dist = Math.abs(d.t - t);
            if (dist < closestDist) {
              closestDist = dist;
              closest = i;
            }
          });
          setHover(closest);
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(233, 185, 73, 0.35)" />
            <stop offset="100%" stopColor="rgba(233, 185, 73, 0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ratingFill)" />
        <path d={linePath} fill="none" stroke="#e9b949" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {hover !== null && (
          <line x1={x(data[hover].t)} x2={x(data[hover].t)} y1={0} y2={height} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        )}
        <circle cx={x(active.t)} cy={y(active.rating)} r={3.5} fill="#e9b949" stroke="#0b0e17" strokeWidth={1.5} />
      </svg>
    </div>
  );
}
