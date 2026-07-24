import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { streamGame, streamTvChannelFeed } from '../api/lichess';
import type { LichessGameStreamEvent, LichessGameStreamInfo, LichessTvFeedEvent } from '../types/lichess';
import type { MoveStep } from '../lib/chess';
import { START_FEN } from '../lib/chess';

export interface LiveGameState {
  fen: string;
  moves: MoveStep[];
  lastMoveUci?: string;
  whiteClock?: number;
  blackClock?: number;
  white?: { name: string; title?: string; rating?: number };
  black?: { name: string; title?: string; rating?: number };
  orientation: 'white' | 'black';
  gameId?: string;
  status: 'connecting' | 'live' | 'error';
}

const INITIAL: LiveGameState = { fen: START_FEN, moves: [], orientation: 'white', status: 'connecting' };

function applyUciMove(chess: Chess, uci?: string): { san: string; color: 'w' | 'b' } | null {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
  try {
    const mv = chess.move({ from, to, promotion });
    return mv ? { san: mv.san, color: mv.color } : null;
  } catch {
    return null;
  }
}

function appendMove(moves: MoveStep[], fen: string, applied: { san: string; color: 'w' | 'b' } | null): MoveStep[] {
  if (!applied) return moves;
  return [...moves, { fen, san: applied.san, moveNumber: Math.floor(moves.length / 2) + 1, color: applied.color }];
}

export function useTvChannelGame(channel: string | null): LiveGameState {
  const [state, setState] = useState<LiveGameState>(INITIAL);
  const chessRef = useRef(new Chess());

  useEffect(() => {
    if (!channel) return;
    setState(INITIAL);

    const stop = streamTvChannelFeed(
      channel,
      (evt: LichessTvFeedEvent) => {
        if (evt.t === 'featured') {
          const chess = new Chess();
          if (evt.d.fen) {
            try {
              chess.load(evt.d.fen);
            } catch {
              /* non-standard variant fen */
            }
          }
          chessRef.current = chess;
          const white = evt.d.players?.find((p) => p.color === 'white');
          const black = evt.d.players?.find((p) => p.color === 'black');
          setState({
            fen: evt.d.fen ?? START_FEN,
            moves: [],
            lastMoveUci: evt.d.lm,
            whiteClock: white?.seconds,
            blackClock: black?.seconds,
            white: white ? { name: white.user?.name ?? 'Stockfish', title: white.user?.title ?? undefined, rating: white.rating } : undefined,
            black: black ? { name: black.user?.name ?? 'Stockfish', title: black.user?.title ?? undefined, rating: black.rating } : undefined,
            orientation: evt.d.orientation ?? 'white',
            gameId: evt.d.id,
            status: 'live',
          });
        } else if (evt.t === 'fen') {
          const applied = applyUciMove(chessRef.current, evt.d.lm);
          setState((s) => ({
            ...s,
            fen: evt.d.fen ?? s.fen,
            lastMoveUci: evt.d.lm,
            whiteClock: evt.d.wc ?? s.whiteClock,
            blackClock: evt.d.bc ?? s.blackClock,
            moves: appendMove(s.moves, evt.d.fen ?? s.fen, applied),
            status: 'live',
          }));
        }
      },
      () => setState((s) => ({ ...s, status: 'error' })),
    );

    return stop;
  }, [channel]);

  return state;
}

export function useGameStream(gameId: string | null): LiveGameState {
  const [state, setState] = useState<LiveGameState>(INITIAL);
  const chessRef = useRef(new Chess());

  useEffect(() => {
    if (!gameId) return;
    chessRef.current = new Chess();
    setState({ ...INITIAL, gameId });

    const stop = streamGame(
      gameId,
      (evt: LichessGameStreamEvent) => {
        if ('players' in evt && 'variant' in evt) {
          const info = evt as LichessGameStreamInfo;
          chessRef.current = new Chess();
          setState({
            fen: START_FEN,
            moves: [],
            orientation: 'white',
            gameId: info.id,
            status: 'live',
            white: info.players.white.user
              ? { name: info.players.white.user.name, title: info.players.white.user.title ?? undefined, rating: info.players.white.rating }
              : { name: `AI level ${info.players.white.aiLevel ?? '?'}` },
            black: info.players.black.user
              ? { name: info.players.black.user.name, title: info.players.black.user.title ?? undefined, rating: info.players.black.rating }
              : { name: `AI level ${info.players.black.aiLevel ?? '?'}` },
          });
        } else {
          const frame = evt as { fen: string; lm?: string; wc?: number; bc?: number };
          const applied = applyUciMove(chessRef.current, frame.lm);
          setState((s) => ({
            ...s,
            fen: frame.fen ?? s.fen,
            lastMoveUci: frame.lm ?? s.lastMoveUci,
            whiteClock: frame.wc ?? s.whiteClock,
            blackClock: frame.bc ?? s.blackClock,
            moves: appendMove(s.moves, frame.fen ?? s.fen, applied),
            status: 'live',
          }));
        }
      },
      () => setState((s) => ({ ...s, status: 'error' })),
    );

    return stop;
  }, [gameId]);

  return state;
}
