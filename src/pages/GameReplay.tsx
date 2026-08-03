import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FlipVertical2, Gauge } from 'lucide-react';
import BoardPanel from '../components/BoardPanel';
import MoveList from '../components/MoveList';
import PlayerBadge from '../components/PlayerBadge';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { useAsync } from '../hooks/useAsync';
import { useGameAccuracy } from '../hooks/useGameAccuracy';
import { getGamePgn } from '../api/lichess';
import { movesFromPgn, START_FEN } from '../lib/chess';
import type { ChessComGame } from '../types/chesscom';

interface ReplayLocationState {
  source?: 'lichess' | 'chesscom';
  gameId?: string;
  game?: ChessComGame;
}

interface ReplayData {
  pgn: string;
  white: string;
  black: string;
}

async function loadReplay(gameId: string, state: ReplayLocationState | null): Promise<ReplayData> {
  if (state?.source === 'chesscom' && state.game) {
    return { pgn: state.game.pgn, white: state.game.white.username, black: state.game.black.username };
  }
  const lichessId = state?.gameId ?? gameId;
  const pgn = await getGamePgn(lichessId);
  const whiteMatch = pgn.match(/\[White "([^"]+)"\]/);
  const blackMatch = pgn.match(/\[Black "([^"]+)"\]/);
  return { pgn, white: whiteMatch?.[1] ?? 'White', black: blackMatch?.[1] ?? 'Black' };
}

export default function GameReplay() {
  const { gameId = '' } = useParams<{ gameId: string }>();
  const location = useLocation();
  const state = (location.state as ReplayLocationState | null) ?? null;

  const { data, loading, error } = useAsync(() => loadReplay(gameId, state), [gameId]);
  const [index, setIndex] = useState(-1);
  const [flipped, setFlipped] = useState(false);
  const accuracy = useGameAccuracy();

  const moves = data ? movesFromPgn(data.pgn) : [];

  useEffect(() => {
    setIndex(moves.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pgn]);

  useEffect(() => () => accuracy.cancel(), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(-1, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(moves.length - 1, i + 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moves.length]);

  if (loading) return <LoadingBlock label="Loading game…" />;
  if (error || !data) return <ErrorBlock message={error?.message ?? 'Could not load this game.'} />;

  const fen = index === -1 ? START_FEN : moves[index].fen;
  const lastMoveSan = index >= 0 ? moves[index].san : undefined;
  const orientation = flipped ? 'black' : 'white';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">Game replay</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => accuracy.run(START_FEN, moves)}
            disabled={accuracy.running || moves.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10 disabled:opacity-40"
          >
            <Gauge size={15} /> {accuracy.running ? `Analyzing… ${accuracy.progress}/${accuracy.total}` : 'Compute accuracy'}
          </button>
          <button
            onClick={() => setFlipped((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <FlipVertical2 size={15} /> Flip
          </button>
        </div>
      </div>

      {accuracy.result && (
        <div className="flex items-center justify-center gap-8 rounded-2xl border border-white/8 bg-ink-850/60 p-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-ink-400">{data.white}</p>
            <p className="font-display text-2xl font-semibold text-ink-100">{accuracy.result.white.toFixed(1)}%</p>
          </div>
          <span className="text-ink-500">accuracy</span>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-ink-400">{data.black}</p>
            <p className="font-display text-2xl font-semibold text-ink-100">{accuracy.result.black.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex flex-col items-center gap-3">
          <PlayerBadge color={orientation === 'white' ? 'black' : 'white'} name={orientation === 'white' ? data.black : data.white} />
          <BoardPanel fen={fen} orientation={orientation} />
          <PlayerBadge color={orientation === 'white' ? 'white' : 'black'} name={orientation === 'white' ? data.white : data.black} />

          <div className="flex items-center gap-2">
            <NavButton onClick={() => setIndex(-1)} disabled={index === -1}>
              <ChevronFirst size={18} />
            </NavButton>
            <NavButton onClick={() => setIndex((i) => Math.max(-1, i - 1))} disabled={index === -1}>
              <ChevronLeft size={18} />
            </NavButton>
            <span className="min-w-[6rem] text-center text-sm text-ink-400 tabular-nums">
              {index === -1
                ? 'Start'
                : `${moves[index].moveNumber}${moves[index].color === 'w' ? '.' : '...'}${lastMoveSan ? ` ${lastMoveSan}` : ''}`}
            </span>
            <NavButton onClick={() => setIndex((i) => Math.min(moves.length - 1, i + 1))} disabled={index === moves.length - 1}>
              <ChevronRight size={18} />
            </NavButton>
            <NavButton onClick={() => setIndex(moves.length - 1)} disabled={index === moves.length - 1}>
              <ChevronLast size={18} />
            </NavButton>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-ink-850/60 p-3">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Moves</h2>
          <div className="h-[420px] overflow-y-auto">
            <MoveList moves={moves} activeIndex={index} onSelect={setIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
    >
      {children}
    </button>
  );
}
