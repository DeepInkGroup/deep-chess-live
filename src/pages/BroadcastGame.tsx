import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FlipVertical2, Radio } from 'lucide-react';
import BoardPanel from '../components/BoardPanel';
import PlayerBadge from '../components/PlayerBadge';
import MoveList from '../components/MoveList';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { usePolling } from '../hooks/useAsync';
import { getBroadcastRound, getBroadcastRoundPgn } from '../api/lichess';
import { movesFromPgn, splitBroadcastPgn, START_FEN } from '../lib/chess';
import type { MoveStep } from '../lib/chess';

export default function BroadcastGame() {
  const { roundId = '', gameId = '' } = useParams<{ roundId: string; gameId: string }>();
  const [moves, setMoves] = useState<MoveStep[]>([]);
  const [index, setIndex] = useState(-1);
  const [following, setFollowing] = useState(true);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const roundState = usePolling(() => getBroadcastRound(roundId), 5000, [roundId]);
  const pgnState = usePolling(() => getBroadcastRoundPgn(roundId), 5000, [roundId]);

  const liveGame = roundState.data?.games.find((g) => g.id === gameId);

  useEffect(() => {
    if (!pgnState.data) return;
    const pgn = splitBroadcastPgn(pgnState.data)[gameId];
    if (!pgn) return;
    const parsed = movesFromPgn(pgn);
    setMoves(parsed);
    setIndex((i) => (following ? parsed.length - 1 : i));
  }, [pgnState.data, gameId, following]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setFollowing(false);
        setIndex((i) => Math.max(-1, i - 1));
      }
      if (e.key === 'ArrowRight') {
        setIndex((i) => {
          const next = Math.min(moves.length - 1, i + 1);
          if (next === moves.length - 1) setFollowing(true);
          return next;
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moves.length]);

  if (roundState.loading && !roundState.data) return <LoadingBlock label="Loading game…" />;
  if (roundState.error && !roundState.data) return <ErrorBlock message="Couldn't load this game." />;
  if (roundState.data && !liveGame) return <ErrorBlock message="This game wasn't found in the round." />;

  const fen = index >= 0 ? (moves[index]?.fen ?? START_FEN) : (liveGame?.fen ?? START_FEN);
  const white = liveGame?.players[0];
  const black = liveGame?.players[1];
  const finished = liveGame?.status && liveGame.status !== '*';
  const whiteToMove = moves.length % 2 === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          {roundState.data && (
            <Link
              to={`/broadcasts/${roundState.data.tour.id}`}
              state={{ roundId }}
              className="mb-1 flex items-center gap-1 text-xs text-ink-400 hover:text-gold-400"
            >
              <ArrowLeft size={12} /> {roundState.data.tour.name} · {roundState.data.round.name}
            </Link>
          )}
          <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100 sm:text-2xl">
            {liveGame?.name ?? `${white?.name ?? '?'} - ${black?.name ?? '?'}`}
          </h1>
        </div>
        <div className="flex gap-2">
          {!following && (
            <button
              onClick={() => {
                setFollowing(true);
                setIndex(moves.length - 1);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/20"
            >
              <Radio size={14} /> Go live
            </button>
          )}
          <button
            onClick={() => setOrientation((v) => (v === 'white' ? 'black' : 'white'))}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink-200 hover:bg-white/10"
          >
            <FlipVertical2 size={15} /> Flip
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex flex-col items-center gap-3">
          {(() => {
            const info = { white, black };
            const top = orientation === 'white' ? 'black' : 'white';
            const bottom = orientation === 'white' ? 'white' : 'black';
            return (
              <>
                <PlayerBadge
                  color={top}
                  name={info[top]?.name ?? '?'}
                  title={info[top]?.title ?? null}
                  rating={info[top]?.rating}
                  clockSeconds={info[top]?.clock !== undefined ? info[top]!.clock! / 100 : undefined}
                  active={!finished && (top === 'white' ? whiteToMove : !whiteToMove)}
                />
                <BoardPanel fen={fen} orientation={orientation} lastMoveUci={index >= 0 ? moves[index]?.uci : undefined} />
                <PlayerBadge
                  color={bottom}
                  name={info[bottom]?.name ?? '?'}
                  title={info[bottom]?.title ?? null}
                  rating={info[bottom]?.rating}
                  clockSeconds={info[bottom]?.clock !== undefined ? info[bottom]!.clock! / 100 : undefined}
                  active={!finished && (bottom === 'white' ? whiteToMove : !whiteToMove)}
                />
              </>
            );
          })()}
          {finished && <p className="text-sm font-semibold text-ink-300">{liveGame?.status}</p>}
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-ink-850/60 p-3">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Moves</h2>
          <div className="h-[420px] overflow-y-auto">
            <MoveList
              moves={moves}
              activeIndex={index}
              onSelect={(i) => {
                setFollowing(i === moves.length - 1);
                setIndex(i);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
