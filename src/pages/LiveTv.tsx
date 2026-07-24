import { Radio } from 'lucide-react';
import TvChannelCard from '../components/TvChannelCard';

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

export default function LiveTv() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
          <Radio className="text-gold-400" /> Live TV
        </h1>
        <p className="mt-1 text-sm text-ink-400">The top game in every Lichess category, updating live. Click any board to watch full-screen.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ALL_CHANNELS.map((c, i) => (
          <TvChannelCard key={c} channelKey={c} live={i < 6} />
        ))}
      </div>
    </div>
  );
}
