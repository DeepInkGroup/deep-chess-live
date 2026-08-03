import { useEffect, useRef, useState } from 'react';

export interface EngineLine {
  depth: number;
  multipv: number;
  scoreCp?: number;
  scoreMate?: number;
  pvUci: string[];
}

export interface EngineState {
  ready: boolean;
  thinking: boolean;
  lines: EngineLine[];
  bestMoveUci?: string;
}

export interface EngineOptions {
  /** Number of principal variations to search in parallel. */
  multiPv?: number;
  /** 0-20. Leave undefined/null for full playing strength. */
  skillLevel?: number | null;
}

function parseInfoLine(line: string): EngineLine | null {
  if (!line.startsWith('info') || !line.includes(' pv ')) return null;
  const depthMatch = line.match(/\bdepth (\d+)/);
  const multipvMatch = line.match(/\bmultipv (\d+)/);
  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  const mateMatch = line.match(/\bscore mate (-?\d+)/);
  const pvMatch = line.match(/\bpv (.+)$/);
  if (!depthMatch || !pvMatch) return null;

  return {
    depth: Number(depthMatch[1]),
    multipv: multipvMatch ? Number(multipvMatch[1]) : 1,
    scoreCp: cpMatch ? Number(cpMatch[1]) : undefined,
    scoreMate: mateMatch ? Number(mateMatch[1]) : undefined,
    pvUci: pvMatch[1].trim().split(/\s+/),
  };
}

export function useStockfish(enabled = true, options: EngineOptions = {}) {
  const { multiPv = 3, skillLevel = null } = options;
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<EngineState>({ ready: false, thinking: false, lines: [] });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!enabled) return;

    const worker = new Worker(`${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`);
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line === 'uciok') {
        worker.postMessage('isready');
      } else if (line === 'readyok') {
        setState((s) => (s.ready ? s : { ...s, ready: true }));
      } else if (line.startsWith('info')) {
        const parsed = parseInfoLine(line);
        if (parsed) {
          setState((s) => {
            const lines = [...s.lines];
            const idx = lines.findIndex((l) => l.multipv === parsed.multipv);
            if (idx >= 0) lines[idx] = parsed;
            else lines.push(parsed);
            lines.sort((a, b) => a.multipv - b.multipv);
            return { ...s, lines };
          });
        }
      } else if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        setState((s) => ({ ...s, thinking: false, bestMoveUci: move !== '(none)' ? move : undefined }));
      }
    };

    worker.postMessage('uci');

    return () => {
      worker.terminate();
      workerRef.current = null;
      setState({ ready: false, thinking: false, lines: [] });
    };
  }, [enabled]);

  // Apply (or re-apply) engine options whenever they change or the engine becomes ready.
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker || !state.ready) return;
    worker.postMessage(`setoption name MultiPV value ${multiPv}`);
    if (skillLevel === null || skillLevel === undefined) {
      worker.postMessage('setoption name UCI_LimitStrength value false');
    } else {
      worker.postMessage('setoption name UCI_LimitStrength value true');
      worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    }
  }, [multiPv, skillLevel, state.ready]);

  function analyze(fen: string, depth = 18) {
    const worker = workerRef.current;
    if (!worker || !stateRef.current.ready) return;
    setState((s) => ({ ...s, thinking: true, lines: [], bestMoveUci: undefined }));
    worker.postMessage('stop');
    worker.postMessage('position fen ' + fen);
    worker.postMessage('go depth ' + depth);
  }

  function stop() {
    workerRef.current?.postMessage('stop');
  }

  return { ...state, analyze, stop };
}
