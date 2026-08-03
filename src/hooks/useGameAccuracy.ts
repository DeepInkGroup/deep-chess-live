import { useRef, useState } from 'react';
import type { MoveStep } from '../lib/chess';

export interface AccuracyResult {
  white: number;
  black: number;
}

export function winPercent(whiteCp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * whiteCp)) - 1);
}

function moveAccuracy(lossPct: number): number {
  const acc = 103.1668 * Math.exp(-0.04354 * lossPct) - 3.1669;
  return Math.max(0, Math.min(100, acc));
}

function evaluatePosition(worker: Worker, fen: string, depth: number): Promise<number> {
  const sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  return new Promise((resolve) => {
    let cp: number | undefined;
    let mate: number | undefined;
    worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line.startsWith('info') && line.includes(' pv ')) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        if (cpMatch) cp = Number(cpMatch[1]);
        if (mateMatch) mate = Number(mateMatch[1]);
      } else if (line.startsWith('bestmove')) {
        const sign = sideToMove === 'w' ? 1 : -1;
        const whiteCp = mate !== undefined ? (mate > 0 ? 100000 : -100000) * sign : (cp ?? 0) * sign;
        resolve(whiteCp);
      }
    };
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
}

/** Runs a one-off Stockfish worker over a finished game's positions and derives an approximate per-side accuracy score. */
export function useGameAccuracy() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<AccuracyResult | null>(null);
  const [evalHistory, setEvalHistory] = useState<number[] | null>(null);
  const cancelRef = useRef(false);

  async function run(basePosition: string, moves: MoveStep[], depth = 12, maxPlies = 60) {
    cancelRef.current = false;
    setRunning(true);
    setResult(null);
    setEvalHistory(null);
    const trimmed = moves.slice(0, maxPlies);
    setTotal(trimmed.length + 1);
    setProgress(0);

    const worker = new Worker(`${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`);
    await new Promise<void>((resolve) => {
      worker.onmessage = (e: MessageEvent<string>) => {
        if (e.data === 'uciok') worker.postMessage('isready');
        else if (e.data === 'readyok') resolve();
      };
      worker.postMessage('uci');
    });

    const fens = [basePosition, ...trimmed.map((m) => m.fen)];
    const evals: number[] = [];
    for (let i = 0; i < fens.length; i++) {
      if (cancelRef.current) {
        worker.terminate();
        setRunning(false);
        return;
      }
      evals.push(await evaluatePosition(worker, fens[i], depth));
      setProgress(i + 1);
    }
    worker.terminate();

    const whiteAcc: number[] = [];
    const blackAcc: number[] = [];
    for (let i = 0; i < trimmed.length; i++) {
      const before = winPercent(evals[i]);
      const after = winPercent(evals[i + 1]);
      const loss = trimmed[i].color === 'w' ? Math.max(0, before - after) : Math.max(0, after - before);
      const acc = moveAccuracy(loss);
      (trimmed[i].color === 'w' ? whiteAcc : blackAcc).push(acc);
    }
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    setResult({ white: avg(whiteAcc), black: avg(blackAcc) });
    setEvalHistory(evals);
    setRunning(false);
  }

  function cancel() {
    cancelRef.current = true;
  }

  return { run, cancel, running, progress, total, result, evalHistory };
}
