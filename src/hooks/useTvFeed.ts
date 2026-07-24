import { useEffect, useRef, useState } from 'react';
import { streamTvChannelFeed } from '../api/lichess';
import type { LichessPlayerRef, LichessTvFeedEvent } from '../types/lichess';
import { START_FEN } from '../lib/chess';

export interface TvFeedState {
  fen: string;
  lastMoveUci?: string;
  whiteClock?: number;
  blackClock?: number;
  players?: { color: 'white' | 'black'; user?: LichessPlayerRef; rating: number }[];
  gameId?: string;
  orientation?: 'white' | 'black';
  connected: boolean;
}

export function useTvFeed(channel: string | null): TvFeedState {
  const [state, setState] = useState<TvFeedState>({ fen: START_FEN, connected: false });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!channel) return;
    setState({ fen: START_FEN, connected: false });

    const stop = streamTvChannelFeed(channel, (evt: LichessTvFeedEvent) => {
      if (evt.t === 'featured') {
        setState({
          fen: evt.d.fen ?? START_FEN,
          lastMoveUci: evt.d.lm,
          players: evt.d.players,
          gameId: evt.d.id,
          orientation: evt.d.orientation,
          whiteClock: evt.d.players?.find((p) => p.color === 'white')?.seconds,
          blackClock: evt.d.players?.find((p) => p.color === 'black')?.seconds,
          connected: true,
        });
      } else if (evt.t === 'fen') {
        setState((s) => ({
          ...s,
          fen: evt.d.fen ?? s.fen,
          lastMoveUci: evt.d.lm,
          whiteClock: evt.d.wc,
          blackClock: evt.d.bc,
          connected: true,
        }));
      }
    });

    return stop;
  }, [channel]);

  return state;
}
