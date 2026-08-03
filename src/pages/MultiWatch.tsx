import { useEffect, useState } from 'react';
import { Grid2x2 } from 'lucide-react';
import TvChannelCard, { channelLabel } from '../components/TvChannelCard';
import BetaBadge from '../components/BetaBadge';

const ALL_CHANNELS = [
  'best',
  'bullet',
  'blitz',
  'rapid',
  'classical',
  'ultraBullet',
  'chess960',
  'crazyhouse',
  'bot',
  'computer',
  'antichess',
  'atomic',
  'horde',
  'kingOfTheHill',
  'racingKings',
  'threeCheck',
];

const MAX_BOARDS = 6;
const STORAGE_KEY = 'deepchess.multiWatch.v1';

export default function MultiWatch() {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : ['best', 'bullet', 'blitz', 'rapid'];
    } catch {
      return ['best', 'bullet', 'blitz', 'rapid'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      /* localStorage unavailable */
    }
  }, [selected]);

  function toggle(channel: string) {
    setSelected((prev) => {
      if (prev.includes(channel)) return prev.filter((c) => c !== channel);
      if (prev.length >= MAX_BOARDS) return prev;
      return [...prev, channel];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Grid2x2 className="text-gold-400" /> Multi-board <BetaBadge />
        </h1>
        <p className="mt-1 text-sm text-ink-400">Pick up to {MAX_BOARDS} channels to watch side by side.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_CHANNELS.map((c) => {
          const active = selected.includes(c);
          const disabled = !active && selected.length >= MAX_BOARDS;
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              disabled={disabled}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                active ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-ink-300 hover:bg-white/10'
              }`}
            >
              {channelLabel(c)}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-ink-850/50 p-6 text-center text-sm text-ink-400">Pick a channel above to start watching.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((c) => (
            <TvChannelCard key={c} channelKey={c} />
          ))}
        </div>
      )}
    </div>
  );
}
