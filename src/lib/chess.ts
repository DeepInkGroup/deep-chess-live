import { Chess } from 'chess.js';

export interface MoveStep {
  fen: string;
  san: string;
  moveNumber: number;
  color: 'w' | 'b';
}

/** Replays a PGN (or lichess space-separated UCI/SAN move list) into a list of FEN snapshots. */
export function movesFromPgn(pgn: string): MoveStep[] {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }
  const history = chess.history({ verbose: true });
  const replay = new Chess();
  return history.map((move, i) => {
    replay.move(move.san);
    return {
      fen: replay.fen(),
      san: move.san,
      moveNumber: Math.floor(i / 2) + 1,
      color: move.color,
    };
  });
}

export function movesFromSan(sanMoves: string[]): MoveStep[] {
  const chess = new Chess();
  const steps: MoveStep[] = [];
  sanMoves.forEach((san, i) => {
    const move = chess.move(san);
    if (!move) return;
    steps.push({
      fen: chess.fen(),
      san: move.san,
      moveNumber: Math.floor(i / 2) + 1,
      color: move.color,
    });
  });
  return steps;
}

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Lichess puzzle responses don't always include `fen`/`lastMove` directly (e.g. /api/puzzle/next).
 * When missing, derive them by replaying the source game's PGN up to and including `initialPly`.
 */
export function derivePuzzlePosition(puzzle: {
  fen?: string;
  lastMove?: string;
  initialPly: number;
}, gamePgn: string): { fen: string; lastMove?: string } {
  if (puzzle.fen) return { fen: puzzle.fen, lastMove: puzzle.lastMove };

  const chess = new Chess();
  try {
    chess.loadPgn(gamePgn);
  } catch {
    return { fen: START_FEN };
  }
  const history = chess.history({ verbose: true });
  const replay = new Chess();
  for (let i = 0; i <= puzzle.initialPly && i < history.length; i++) {
    replay.move(history[i].san);
  }
  const lastMove = history[puzzle.initialPly]?.lan;
  return { fen: replay.fen(), lastMove };
}

export function turnColorFromFen(fen: string): 'white' | 'black' {
  return fen.split(' ')[1] === 'b' ? 'black' : 'white';
}

export function applyUci(chess: Chess, uci: string) {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;
  return chess.move({ from, to, promotion });
}

export function formatClock(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function timeUntil(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return 'now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ${min % 60}m`;
  const day = Math.floor(hr / 24);
  return `${day}d ${hr % 24}h`;
}

export function formatClockControl(limit: number, increment: number): string {
  const base = limit < 60 ? `${limit}` : `${limit / 60}`;
  return `${base}+${increment}`;
}

/** Converts a UCI move sequence starting from `fen` into SAN notation. Stops at the first illegal/unknown move. */
export function pvToSan(fen: string, pvUci: string[], maxMoves = 8): string[] {
  const chess = new Chess();
  try {
    chess.load(fen);
  } catch {
    return [];
  }
  const sans: string[] = [];
  for (const uci of pvUci.slice(0, maxMoves)) {
    try {
      const move = applyUci(chess, uci);
      if (!move) break;
      sans.push(move.san);
    } catch {
      break;
    }
  }
  return sans;
}

/** Score from the engine is relative to the side to move; convert to White's perspective. */
export function scoreToWhitePerspective(
  sideToMove: 'w' | 'b',
  scoreCp?: number,
  scoreMate?: number,
): { cp?: number; mate?: number } {
  const sign = sideToMove === 'w' ? 1 : -1;
  return {
    cp: scoreCp !== undefined ? scoreCp * sign : undefined,
    mate: scoreMate !== undefined ? scoreMate * sign : undefined,
  };
}

export function formatEval(cp?: number, mate?: number): string {
  if (mate !== undefined) return mate === 0 ? '0-1' : `#${Math.abs(mate)}`;
  if (cp === undefined) return '0.0';
  const v = cp / 100;
  return (v > 0 ? '+' : '') + v.toFixed(1);
}

/** Maps a white-perspective eval to a 0-100 bar fill percentage (white's share). */
export function evalToBarPercent(cp?: number, mate?: number): number {
  if (mate !== undefined) return mate > 0 ? 100 : mate < 0 ? 0 : 50;
  if (cp === undefined) return 50;
  const clamped = Math.max(-1000, Math.min(1000, cp));
  return 50 + (clamped / 1000) * 50;
}
