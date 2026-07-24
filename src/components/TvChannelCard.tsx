import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Play, Radio } from 'lucide-react';
import { useTvFeed } from '../hooks/useTvFeed';

const CHANNEL_LABELS: Record<string, string> = {
  bot: 'Bot',
  blitz: 'Blitz',
  racingKings: 'Racing Kings',
  ultraBullet: 'UltraBullet',
  bullet: 'Bullet',
  classical: 'Classical',
  threeCheck: 'Three-check',
  antichess: 'Antichess',
  atomic: 'Atomic',
  horde: 'Horde',
  rapid: 'Rapid',
  chess960: 'Chess960',
  kingOfTheHill: 'King of the Hill',
  crazyhouse: 'Crazyhouse',
  computer: 'Computer',
  best: 'Top Rated',
};

export function channelLabel(key: string): string {
  return CHANNEL_LABELS[key] ?? key;
}

interface TvChannelCardProps {
  channelKey: string;
  live?: boolean;
}

export default function TvChannelCard({ channelKey, live = true }: TvChannelCardProps) {
  const feed = useTvFeed(live ? channelKey : null);
  const white = feed.players?.find((p) => p.color === 'white');
  const black = feed.players?.find((p) => p.color === 'black');

  if (!live) {
    return (
      <Link
        to={`/tv/${channelKey}`}
        className="group flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/8 bg-ink-850/60 p-6 text-center transition-all hover:border-gold-500/30 hover:bg-ink-850"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">{channelLabel(channelKey)}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-ink-300 transition-colors group-hover:bg-gold-500/20 group-hover:text-gold-400">
          <Play size={16} />
        </span>
        <span className="text-[11px] text-ink-500">Click to watch live</span>
      </Link>
    );
  }

  return (
    <Link
      to={`/tv/${channelKey}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-850/60 transition-all hover:border-gold-500/30 hover:bg-ink-850"
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">{channelLabel(channelKey)}</span>
        {feed.connected ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            <Radio size={10} /> Connecting
          </span>
        )}
      </div>

      <div className="flex items-center justify-center p-3">
        <div className="pointer-events-none w-full max-w-[220px] overflow-hidden rounded-lg">
          <Chessboard
            position={feed.fen}
            boardWidth={220}
            arePiecesDraggable={false}
            showBoardNotation={false}
            animationDuration={200}
            customBoardStyle={{ borderRadius: '8px' }}
            customDarkSquareStyle={{ backgroundColor: '#6b7a99' }}
            customLightSquareStyle={{ backgroundColor: '#e4e8f3' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-white/5 px-3 py-2 text-xs">
        <PlayerLine label={black} />
        <PlayerLine label={white} />
      </div>
    </Link>
  );
}

function PlayerLine({ label }: { label?: { user?: { name: string; title?: string | null }; rating: number } }) {
  if (!label) {
    return <div className="h-4 w-24 animate-shimmer rounded" />;
  }
  return (
    <div className="flex items-center justify-between text-ink-300">
      <span className="truncate">
        {label.user?.title && <span className="mr-1 text-gold-400">{label.user.title}</span>}
        {label.user?.name ?? 'Stockfish'}
      </span>
      <span className="text-ink-500">{label.rating}</span>
    </div>
  );
}
