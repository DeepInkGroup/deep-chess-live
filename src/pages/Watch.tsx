import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cpu, FlipVertical2, PictureInPicture2 } from 'lucide-react';
import { usePip } from '../contexts/PipContext';
import BoardPanel from '../components/BoardPanel';
import PlayerBadge from '../components/PlayerBadge';
import MoveList from '../components/MoveList';
import EvalBar from '../components/EvalBar';
import EngineLines from '../components/EngineLines';
import SoundToggle from '../components/SoundToggle';
import { useTvChannelGame, useGameStream } from '../hooks/useLiveGame';
import { useStockfish } from '../hooks/useStockfish';
import { useMoveSound } from '../hooks/useMoveSound';
import { channelLabel } from '../components/TvChannelCard';
import { LoadingBlock } from '../components/StatusViews';
import { scoreToWhitePerspective } from '../lib/chess';

export default function Watch() {
  const { channel, gameId } = useParams<{ channel?: string; gameId?: string }>();
  const [flipped, setFlipped] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const { openPip } = usePip();

  const channelGame = useTvChannelGame(channel ?? null);
  const singleGame = useGameStream(gameId ?? null);
  const state = channel ? channelGame : singleGame;

  const orientation = flipped ? (state.orientation === 'white' ? 'black' : 'white') : state.orientation;
  const activeIndex = state.moves.length - 1;

  const title = channel ? `${channelLabel(channel)} · Live TV` : 'Live game';

  const boardFen = useMemo(() => state.fen, [state.fen]);

  const stockfish = useStockfish(engineOn);
  useEffect(() => {
    if (!engineOn || !stockfish.ready) return;
    const t = setTimeout(() => stockfish.analyze(boardFen, 16), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardFen, engineOn, stockfish.ready]);

  const sideToMove = boardFen.split(' ')[1] === 'b' ? 'b' : 'w';
  const topLine = stockfish.lines[0];
  const persp = scoreToWhitePerspective(sideToMove, topLine?.scoreCp, topLine?.scoreMate);

  useMoveSound(state.moves);

  if (state.status === 'connecting') {
    return <LoadingBlock label="Connecting to the game feed…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">{title}</h1>
          {state.status === 'error' && <p className="mt-1 text-sm text-ruby-400">Connection lost. Trying to display last known position.</p>}
        </div>
        <div className="flex gap-2">
          <SoundToggle />
          <button
            onClick={() => setEngineOn((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              engineOn ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10'
            }`}
          >
            <Cpu size={15} /> Engine
          </button>
          <button
            onClick={() => setFlipped((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <FlipVertical2 size={15} /> Flip
          </button>
          <button
            onClick={() =>
              openPip(
                channel
                  ? { kind: 'tv', channel, label: title }
                  : { kind: 'game', gameId: gameId ?? '', label: title },
              )
            }
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <PictureInPicture2 size={15} /> Pop out
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex items-start gap-3">
          {engineOn && <EvalBar cp={persp.cp} mate={persp.mate} />}
          <div className="flex flex-col items-center gap-3">
            {(() => {
              const whiteToMove = state.moves.length % 2 === 0;
              const top = orientation === 'white' ? 'black' : 'white';
              const bottom = orientation === 'white' ? 'white' : 'black';
              const info = { white: state.white, black: state.black };
              const clocks = { white: state.whiteClock, black: state.blackClock };
              return (
                <>
                  <PlayerBadge
                    color={top}
                    name={info[top]?.name ?? '?'}
                    title={info[top]?.title ?? null}
                    rating={info[top]?.rating}
                    clockSeconds={clocks[top]}
                    active={top === 'white' ? whiteToMove : !whiteToMove}
                  />
                  <BoardPanel fen={boardFen} orientation={orientation} lastMoveUci={state.lastMoveUci} bestMoveUci={engineOn ? stockfish.bestMoveUci : undefined} />
                  <PlayerBadge
                    color={bottom}
                    name={info[bottom]?.name ?? '?'}
                    title={info[bottom]?.title ?? null}
                    rating={info[bottom]?.rating}
                    clockSeconds={clocks[bottom]}
                    active={bottom === 'white' ? whiteToMove : !whiteToMove}
                  />
                </>
              );
            })()}
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          {engineOn && <EngineLines fen={boardFen} lines={stockfish.lines} thinking={stockfish.thinking} ready={stockfish.ready} />}
          <div className="rounded-2xl border border-white/8 bg-ink-850/60 p-3">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Moves</h2>
            <div className="h-[420px] overflow-y-auto">
              <MoveList moves={state.moves} activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
