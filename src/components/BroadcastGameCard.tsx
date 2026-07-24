import { Chessboard } from 'react-chessboard';
import type { LichessBroadcastGame } from '../types/lichess';
import { formatClock } from '../lib/chess';

export default function BroadcastGameCard({ game }: { game: LichessBroadcastGame }) {
  const white = game.players[0];
  const black = game.players[1];
  const finished = game.status && game.status !== '*';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-850/60">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="truncate text-xs font-semibold text-ink-300">{game.name ?? `${white?.name} - ${black?.name}`}</span>
        {finished ? (
          <span className="shrink-0 rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-ink-300">{game.status}</span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-400" /> Live
          </span>
        )}
      </div>

      <div className="flex items-center justify-center p-3">
        <div className="pointer-events-none w-full max-w-[220px] overflow-hidden rounded-lg">
          <Chessboard
            position={game.fen}
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
        <PlayerRow player={black} />
        <PlayerRow player={white} />
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player?: { name: string; title?: string; rating?: number; clock?: number } }) {
  if (!player) return <div className="h-4 w-24 animate-shimmer rounded" />;
  return (
    <div className="flex items-center justify-between text-ink-300">
      <span className="truncate">
        {player.title && <span className="mr-1 text-gold-400">{player.title}</span>}
        {player.name}
        {player.rating !== undefined && <span className="ml-1 text-ink-500">({player.rating})</span>}
      </span>
      {player.clock !== undefined && <span className="shrink-0 font-mono text-ink-400">{formatClock(player.clock / 100)}</span>}
    </div>
  );
}
