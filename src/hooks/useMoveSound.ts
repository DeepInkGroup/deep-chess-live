import { useEffect, useRef } from 'react';
import { playMoveSound } from '../lib/sound';
import type { MoveStep } from '../lib/chess';

/** Plays a move/capture sound whenever a new move appears at the end of the list. */
export function useMoveSound(moves: MoveStep[]) {
  const prevLength = useRef(0);

  useEffect(() => {
    if (moves.length > prevLength.current && prevLength.current > 0) {
      const last = moves[moves.length - 1];
      playMoveSound(last.san.includes('x'));
    }
    prevLength.current = moves.length;
  }, [moves]);
}
