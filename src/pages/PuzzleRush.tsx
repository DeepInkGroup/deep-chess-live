import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Timer, Trophy, XCircle, Zap } from 'lucide-react';
import PuzzleBoard from '../components/PuzzleBoard';
import { LoadingBlock, ErrorBlock } from '../components/StatusViews';
import { getNextPuzzle } from '../api/lichess';
import { getBestRushScore, recordPuzzleResult, recordRushScore } from '../lib/puzzleHistory';
import type { LichessPuzzle } from '../types/lichess';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

type Phase = 'select' | 'playing' | 'ended';

export default function PuzzleRush() {
  const [phase, setPhase] = useState<Phase>('select');
  const [duration, setDuration] = useState(180);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [lastResult, setLastResult] = useState<'solved' | 'failed' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function loadNext() {
    setLoading(true);
    setError(null);
    try {
      const next = await getNextPuzzle();
      setPuzzle(next);
    } catch {
      setError("Couldn't load the next puzzle.");
    } finally {
      setLoading(false);
    }
  }

  function start(seconds: number) {
    setDuration(seconds);
    setSecondsLeft(seconds);
    setScore(0);
    setAttempted(0);
    setLastResult(null);
    setPhase('playing');
    loadNext();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase((p) => (p === 'playing' ? 'ended' : p));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function endNow() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('ended');
  }

  function handleResult(solved: boolean) {
    if (!puzzle) return;
    recordPuzzleResult({ id: puzzle.puzzle.id, rating: puzzle.puzzle.rating, solved });
    setAttempted((a) => a + 1);
    setLastResult(solved ? 'solved' : 'failed');
    if (solved) setScore((s) => s + 1);
    setTimeout(() => {
      setLastResult(null);
      loadNext();
    }, 500);
  }

  useEffect(() => {
    if (phase === 'ended' && attempted > 0) {
      recordRushScore(duration, score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'select') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <div>
          <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
            <Zap className="text-gold-400" /> Puzzle Rush
          </h1>
          <p className="mt-1 text-sm text-ink-400">Solve as many puzzles as you can before the clock runs out.</p>
        </div>
        <div className="flex gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => start(d.seconds)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-ink-850/60 px-8 py-6 transition-colors hover:border-gold-500/30"
            >
              <Timer size={24} className="text-gold-400" />
              <span className="font-display text-lg font-semibold text-ink-100">{d.label}</span>
              <span className="text-xs text-ink-500">Best: {getBestRushScore(d.seconds)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'ended') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-ink-850/60 p-8">
          <Trophy size={32} className="text-gold-400" />
          <p className="font-display text-3xl font-semibold text-ink-100">{score}</p>
          <p className="text-sm text-ink-400">
            solved out of {attempted} attempted in {duration / 60} min
          </p>
          {score >= getBestRushScore(duration) && score > 0 && <p className="text-sm font-semibold text-gold-400">New best!</p>}
          <div className="flex gap-2">
            <button
              onClick={() => start(duration)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow-gold"
            >
              <RotateCcw size={15} /> Play again
            </button>
            <button onClick={() => setPhase('select')} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink-200 hover:bg-white/10">
              Change duration
            </button>
            <Link to="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink-200 hover:bg-white/10">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
      <div className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-ink-850/50 px-4 py-2">
        <span className="flex items-center gap-1.5 font-mono text-lg font-semibold text-ink-100 tabular-nums">
          <Timer size={16} className="text-gold-400" /> {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </span>
        <span className="text-sm text-ink-400">Score: {score}</span>
        <button onClick={endNow} className="text-xs text-ink-500 hover:text-ruby-400">
          End
        </button>
      </div>

      {loading && !puzzle && <LoadingBlock label="Loading puzzle…" />}
      {error && !puzzle && <ErrorBlock message={error} />}
      {puzzle && <PuzzleBoard key={puzzle.puzzle.id} puzzle={puzzle} strict onSolved={() => handleResult(true)} onFailed={() => handleResult(false)} />}

      {lastResult && (
        <p className={`flex items-center gap-1.5 text-sm font-semibold ${lastResult === 'solved' ? 'text-emerald-400' : 'text-ruby-400'}`}>
          {lastResult === 'solved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {lastResult === 'solved' ? 'Solved!' : 'Missed — next puzzle…'}
        </p>
      )}
    </div>
  );
}
