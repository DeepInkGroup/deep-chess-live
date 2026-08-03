import { Link } from 'react-router-dom';
import { Maximize2, X } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { usePip } from '../contexts/PipContext';
import { useTvChannelGame, useGameStream } from '../hooks/useLiveGame';
import { useBoardTheme } from '../contexts/BoardThemeContext';

export default function PipBoard() {
  const { target, closePip } = usePip();

  if (!target) return null;
  return <PipInner target={target} onClose={closePip} />;
}

function PipInner({ target, onClose }: { target: NonNullable<ReturnType<typeof usePip>['target']>; onClose: () => void }) {
  const { palette, customPieces } = useBoardTheme();
  const channelGame = useTvChannelGame(target.kind === 'tv' ? target.channel : null);
  const gameStream = useGameStream(target.kind === 'game' ? target.gameId : null);
  const state = target.kind === 'tv' ? channelGame : gameStream;

  const expandTo = target.kind === 'tv' ? `/tv/${target.channel}` : `/watch/${target.gameId}`;

  return (
    <div className="fixed bottom-4 right-4 z-[90] w-48 overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="truncate text-xs font-medium text-ink-300">{target.label}</span>
        <div className="flex shrink-0 items-center gap-1">
          <Link to={expandTo} aria-label="Expand" className="text-ink-400 hover:text-gold-400">
            <Maximize2 size={13} />
          </Link>
          <button onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ruby-400">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="pointer-events-none px-2 pb-2">
        <Chessboard
          position={state.fen}
          boardWidth={176}
          arePiecesDraggable={false}
          showBoardNotation={false}
          animationDuration={200}
          customBoardStyle={{ borderRadius: '6px' }}
          customDarkSquareStyle={{ backgroundColor: palette.dark }}
          customLightSquareStyle={{ backgroundColor: palette.light }}
          customPieces={customPieces}
        />
      </div>
    </div>
  );
}
