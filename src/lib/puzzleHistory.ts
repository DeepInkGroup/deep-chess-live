export interface PuzzleHistoryEntry {
  id: string;
  rating: number;
  solved: boolean;
  date: number;
}

const HISTORY_KEY = 'deepchess.puzzleHistory.v1';
const BEST_STREAK_KEY = 'deepchess.bestStreak.v1';
const MAX_ENTRIES = 200;

function readAll(): PuzzleHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PuzzleHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordPuzzleResult(entry: Omit<PuzzleHistoryEntry, 'date'>) {
  try {
    const all = readAll();
    all.unshift({ ...entry, date: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, MAX_ENTRIES)));
  } catch {
    /* localStorage unavailable */
  }
}

export function getRecentPuzzles(limit = 10): PuzzleHistoryEntry[] {
  return readAll().slice(0, limit);
}

export function getPuzzleStats() {
  const all = readAll();
  return {
    totalSolved: all.filter((e) => e.solved).length,
    totalAttempted: all.length,
    bestStreak: getBestStreak(),
  };
}

export function getBestStreak(): number {
  try {
    return Number(localStorage.getItem(BEST_STREAK_KEY) ?? 0);
  } catch {
    return 0;
  }
}

export function recordStreak(count: number) {
  try {
    if (count > getBestStreak()) localStorage.setItem(BEST_STREAK_KEY, String(count));
  } catch {
    /* localStorage unavailable */
  }
}

/** Solved-puzzle counts per calendar day (local time) for the last `days` days, oldest first. */
export function getActivityByDay(days = 84): { date: string; count: number }[] {
  const all = readAll().filter((e) => e.solved);
  const counts = new Map<string, number>();
  for (const entry of all) {
    const key = new Date(entry.date).toDateString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

const RUSH_BEST_PREFIX = 'deepchess.rushBest.v1.';

export function getBestRushScore(durationSec: number): number {
  try {
    return Number(localStorage.getItem(RUSH_BEST_PREFIX + durationSec) ?? 0);
  } catch {
    return 0;
  }
}

export function recordRushScore(durationSec: number, score: number) {
  try {
    if (score > getBestRushScore(durationSec)) localStorage.setItem(RUSH_BEST_PREFIX + durationSec, String(score));
  } catch {
    /* localStorage unavailable */
  }
}
